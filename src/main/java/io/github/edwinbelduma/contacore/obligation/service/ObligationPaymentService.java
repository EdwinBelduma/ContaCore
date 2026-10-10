package io.github.edwinbelduma.contacore.obligation.service;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.account.domain.AccountType;
import io.github.edwinbelduma.contacore.accounting.account.repository.AccountRepository;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntry;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryLine;
import io.github.edwinbelduma.contacore.accounting.journal.repository.JournalEntryRepository;
import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.accountingentity.repository.AccountingEntityRepository;
import io.github.edwinbelduma.contacore.obligation.domain.Obligation;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationPayment;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationStatus;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationType;
import io.github.edwinbelduma.contacore.obligation.dto.ObligationPaymentResponse;
import io.github.edwinbelduma.contacore.obligation.dto.RegisterObligationPaymentRequest;
import io.github.edwinbelduma.contacore.obligation.repository.ObligationPaymentRepository;
import io.github.edwinbelduma.contacore.obligation.repository.ObligationRepository;
import io.github.edwinbelduma.contacore.user.domain.User;
import io.github.edwinbelduma.contacore.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ObligationPaymentService {

    private final ObligationPaymentRepository paymentRepository;
    private final ObligationRepository obligationRepository;
    private final AccountingEntityRepository accountingEntityRepository;
    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final UserRepository userRepository;

    public ObligationPaymentService(
            ObligationPaymentRepository paymentRepository,
            ObligationRepository obligationRepository,
            AccountingEntityRepository accountingEntityRepository,
            AccountRepository accountRepository,
            JournalEntryRepository journalEntryRepository,
            UserRepository userRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.obligationRepository = obligationRepository;
        this.accountingEntityRepository = accountingEntityRepository;
        this.accountRepository = accountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ObligationPaymentResponse registerPayment(
            UUID entityId,
            UUID obligationId,
            UUID ownerId,
            RegisterObligationPaymentRequest request
    ) {

        AccountingEntity accountingEntity =
                getAccountingEntity(entityId, ownerId);

        Obligation obligation =
                getObligation(entityId, obligationId);

        if (obligation.getStatus() == ObligationStatus.VOIDED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se pueden registrar pagos en una obligación anulada"
            );
        }

        if (obligation.getStatus() == ObligationStatus.PAID) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La obligación ya está completamente pagada"
            );
        }

        if (request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El valor debe ser mayor que cero"
            );
        }

        if (request.amount().compareTo(
                obligation.getOutstandingAmount()
        ) > 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El pago no puede superar el saldo pendiente"
            );
        }

        Account cashAccount =
                getAccount(
                        entityId,
                        request.cashAccountId()
                );

        Account obligationAccount =
                getAccount(
                        entityId,
                        request.obligationAccountId()
                );

        validateAccounts(
                obligation,
                cashAccount,
                obligationAccount
        );

        User user = userRepository
                .findById(ownerId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Usuario no encontrado"
                        )
                );

        JournalEntry journalEntry =
                new JournalEntry(
                        accountingEntity,
                        request.paymentDate(),
                        buildDescription(obligation),
                        obligation.getReference(),
                        user
                );

        if (obligation.getType() == ObligationType.PAYABLE) {

            JournalEntryLine debitLine =
                    new JournalEntryLine(
                            journalEntry,
                            obligationAccount,
                            1,
                            buildDescription(obligation),
                            request.amount(),
                            BigDecimal.ZERO
                    );

            JournalEntryLine creditLine =
                    new JournalEntryLine(
                            journalEntry,
                            cashAccount,
                            2,
                            buildDescription(obligation),
                            BigDecimal.ZERO,
                            request.amount()
                    );

            journalEntry.addLine(debitLine);
            journalEntry.addLine(creditLine);

        } else {

            JournalEntryLine debitLine =
                    new JournalEntryLine(
                            journalEntry,
                            cashAccount,
                            1,
                            buildDescription(obligation),
                            request.amount(),
                            BigDecimal.ZERO
                    );

            JournalEntryLine creditLine =
                    new JournalEntryLine(
                            journalEntry,
                            obligationAccount,
                            2,
                            buildDescription(obligation),
                            BigDecimal.ZERO,
                            request.amount()
                    );

            journalEntry.addLine(debitLine);
            journalEntry.addLine(creditLine);
        }

        journalEntry.post();

        JournalEntry savedJournalEntry =
                journalEntryRepository.save(journalEntry);

        ObligationPayment payment =
                new ObligationPayment(
                        obligation,
                        request.paymentDate(),
                        request.amount(),
                        cashAccount
                );

        payment.attachJournalEntry(savedJournalEntry);

        obligation.registerPayment(
                request.amount()
        );

        ObligationPayment savedPayment =
                paymentRepository.save(payment);

        return toResponse(savedPayment);
    }

    public List<ObligationPaymentResponse> findAll(
            UUID entityId,
            UUID obligationId,
            UUID ownerId
    ) {

        getAccountingEntity(entityId, ownerId);

        getObligation(entityId, obligationId);

        return paymentRepository
                .findByObligation_IdOrderByPaymentDateAscCreatedAtAsc(
                        obligationId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ObligationPaymentResponse findById(
            UUID entityId,
            UUID obligationId,
            UUID paymentId,
            UUID ownerId
    ) {

        getAccountingEntity(entityId, ownerId);

        getObligation(entityId, obligationId);

        ObligationPayment payment =
                paymentRepository
                        .findByIdAndObligation_Id(
                                paymentId,
                                obligationId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Pago no encontrado"
                                )
                        );

        return toResponse(payment);
    }

    private AccountingEntity getAccountingEntity(
            UUID entityId,
            UUID ownerId
    ) {

        return accountingEntityRepository
                .findByIdAndOwner_IdAndActiveTrue(
                        entityId,
                        ownerId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Entidad contable no encontrada"
                        )
                );
    }

    private Obligation getObligation(
            UUID entityId,
            UUID obligationId
    ) {

        return obligationRepository
                .findByIdAndAccountingEntity_Id(
                        obligationId,
                        entityId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Obligación no encontrada"
                        )
                );
    }

    private Account getAccount(
            UUID entityId,
            UUID accountId
    ) {

        return accountRepository
                .findByIdAndAccountingEntity_IdAndActiveTrue(
                        accountId,
                        entityId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cuenta contable no encontrada"
                        )
                );
    }

    private void validateAccounts(
            Obligation obligation,
            Account cashAccount,
            Account obligationAccount
    ) {

        if (cashAccount.getType() != AccountType.ASSET) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cuenta de efectivo o banco debe ser de tipo ASSET"
            );
        }

        if (obligation.getType() == ObligationType.PAYABLE
                && obligationAccount.getType() != AccountType.LIABILITY) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Una obligación PAYABLE requiere una cuenta de tipo LIABILITY"
            );
        }

        if (obligation.getType() == ObligationType.RECEIVABLE
                && obligationAccount.getType() != AccountType.ASSET) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Una obligación RECEIVABLE requiere una cuenta de tipo ASSET"
            );
        }

        if (cashAccount.getId()
                .equals(obligationAccount.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cuenta de efectivo y la cuenta de la obligación deben ser diferentes"
            );
        }
    }

    private String buildDescription(
            Obligation obligation
    ) {

        if (obligation.getType() == ObligationType.PAYABLE) {
            return "Pago de obligación - "
                    + obligation.getDescription();
        }

        return "Cobro de obligación - "
                + obligation.getDescription();
    }

    private ObligationPaymentResponse toResponse(
            ObligationPayment payment
    ) {

        UUID journalEntryId =
                payment.getJournalEntry() != null
                        ? payment.getJournalEntry().getId()
                        : null;

        return new ObligationPaymentResponse(
                payment.getId(),
                payment.getObligation().getId(),
                payment.getPaymentDate(),
                payment.getAmount(),
                payment.getCashAccount().getId(),
                payment.getStatus(),
                journalEntryId
        );
    }
}