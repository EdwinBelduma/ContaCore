package io.github.edwinbelduma.contacore.obligation.service;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.account.domain.AccountType;
import io.github.edwinbelduma.contacore.accounting.account.repository.AccountRepository;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntry;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryLine;
import io.github.edwinbelduma.contacore.accounting.journal.repository.JournalEntryRepository;
import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.accountingentity.repository.AccountingEntityRepository;
import io.github.edwinbelduma.contacore.customer.domain.Customer;
import io.github.edwinbelduma.contacore.customer.repository.CustomerRepository;
import io.github.edwinbelduma.contacore.obligation.domain.Obligation;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationStatus;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationType;
import io.github.edwinbelduma.contacore.obligation.dto.CreateObligationRequest;
import io.github.edwinbelduma.contacore.obligation.dto.ObligationResponse;
import io.github.edwinbelduma.contacore.obligation.dto.UpdateObligationRequest;
import io.github.edwinbelduma.contacore.obligation.repository.ObligationRepository;
import io.github.edwinbelduma.contacore.supplier.domain.Supplier;
import io.github.edwinbelduma.contacore.supplier.repository.SupplierRepository;
import io.github.edwinbelduma.contacore.user.domain.User;
import io.github.edwinbelduma.contacore.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ObligationService {

    private final ObligationRepository obligationRepository;
    private final AccountingEntityRepository accountingEntityRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final UserRepository userRepository;

    public ObligationService(
            ObligationRepository obligationRepository,
            AccountingEntityRepository accountingEntityRepository,
            CustomerRepository customerRepository,
            SupplierRepository supplierRepository,
            AccountRepository accountRepository,
            JournalEntryRepository journalEntryRepository,
            UserRepository userRepository
    ) {
        this.obligationRepository = obligationRepository;
        this.accountingEntityRepository = accountingEntityRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.accountRepository = accountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ObligationResponse create(
            UUID entityId,
            UUID ownerId,
            CreateObligationRequest request
    ) {

        AccountingEntity accountingEntity =
                getAccountingEntity(
                        entityId,
                        ownerId
                );

        validateDates(
                request.issueDate(),
                request.dueDate()
        );

        Customer customer = null;
        Supplier supplier = null;

        if (request.type() == ObligationType.RECEIVABLE) {

            if (request.customerId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Una obligación por cobrar debe tener un cliente"
                );
            }

            if (request.supplierId() != null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Una obligación por cobrar no puede tener proveedor"
                );
            }

            customer = getCustomer(
                    entityId,
                    request.customerId()
            );

        } else if (request.type() == ObligationType.PAYABLE) {

            if (request.supplierId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Una obligación por pagar debe tener un proveedor"
                );
            }

            if (request.customerId() != null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Una obligación por pagar no puede tener cliente"
                );
            }

            supplier = getSupplier(
                    entityId,
                    request.supplierId()
            );
        }

        Account obligationAccount =
                getAccount(
                        entityId,
                        request.obligationAccountId()
                );

        Account counterpartAccount =
                getAccount(
                        entityId,
                        request.counterpartAccountId()
                );

        validateAccountingAccounts(
                request.type(),
                obligationAccount,
                counterpartAccount
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
                        request.issueDate(),
                        "Reconocimiento de obligación - "
                                + request.description().trim(),
                        normalize(request.reference()),
                        user
                );

        JournalEntryLine debitLine;
        JournalEntryLine creditLine;

        if (request.type() == ObligationType.PAYABLE) {

            debitLine = new JournalEntryLine(
                    journalEntry,
                    counterpartAccount,
                    1,
                    request.description().trim(),
                    request.totalAmount(),
                    BigDecimal.ZERO
            );

            creditLine = new JournalEntryLine(
                    journalEntry,
                    obligationAccount,
                    2,
                    request.description().trim(),
                    BigDecimal.ZERO,
                    request.totalAmount()
            );

        } else {

            debitLine = new JournalEntryLine(
                    journalEntry,
                    obligationAccount,
                    1,
                    request.description().trim(),
                    request.totalAmount(),
                    BigDecimal.ZERO
            );

            creditLine = new JournalEntryLine(
                    journalEntry,
                    counterpartAccount,
                    2,
                    request.description().trim(),
                    BigDecimal.ZERO,
                    request.totalAmount()
            );
        }

        journalEntry.addLine(debitLine);
        journalEntry.addLine(creditLine);

        journalEntry.post();

        JournalEntry savedJournalEntry =
                journalEntryRepository.save(journalEntry);

        Obligation obligation =
                new Obligation(
                        accountingEntity,
                        request.type(),
                        customer,
                        supplier,
                        request.issueDate(),
                        request.dueDate(),
                        request.description().trim(),
                        normalize(request.reference()),
                        request.totalAmount(),
                        obligationAccount,
                        counterpartAccount
                );

        obligation.attachJournalEntry(
                savedJournalEntry
        );

        Obligation saved =
                obligationRepository.save(obligation);

        return toResponse(saved);
    }

    @Transactional
    public List<ObligationResponse> findAll(
            UUID entityId,
            UUID ownerId
    ) {

        return search(
                entityId,
                ownerId,
                null,
                null,
                null,
                null
        );
    }

    @Transactional
    public List<ObligationResponse> search(
            UUID entityId,
            UUID ownerId,
            ObligationType type,
            ObligationStatus status,
            LocalDate dueFrom,
            LocalDate dueTo
    ) {

        getAccountingEntity(
                entityId,
                ownerId
        );

        if (dueFrom != null
                && dueTo != null
                && dueFrom.isAfter(dueTo)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha inicial de vencimiento no puede ser posterior a la fecha final"
            );
        }

        List<Obligation> obligations =
                obligationRepository.search(
                        entityId,
                        type,
                        dueFrom,
                        dueTo
                );

        obligations.forEach(
                Obligation::refreshStatus
        );

        return obligations
                .stream()
                .filter(obligation ->
                        status == null
                                || obligation.getStatus() == status
                )
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ObligationResponse findById(
            UUID entityId,
            UUID obligationId,
            UUID ownerId
    ) {

        getAccountingEntity(
                entityId,
                ownerId
        );

        Obligation obligation =
                getObligation(
                        entityId,
                        obligationId
                );

        obligation.refreshStatus();

        return toResponse(obligation);
    }

    @Transactional
    public ObligationResponse update(
            UUID entityId,
            UUID obligationId,
            UUID ownerId,
            UpdateObligationRequest request
    ) {

        getAccountingEntity(
                entityId,
                ownerId
        );

        Obligation obligation =
                getObligation(
                        entityId,
                        obligationId
                );

        obligation.refreshStatus();

        if (obligation.getStatus() != ObligationStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden modificar obligaciones en estado PENDING"
            );
        }

        if (obligation.getPaidAmount().signum() > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede modificar una obligación que ya tiene pagos"
            );
        }

        if (obligation.getJournalEntry() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La obligación ya fue reconocida contablemente y no puede modificarse directamente"
            );
        }

        validateDates(
                request.issueDate(),
                request.dueDate()
        );

        Customer customer = null;
        Supplier supplier = null;

        if (obligation.getType() == ObligationType.RECEIVABLE) {

            if (request.customerId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Una obligación por cobrar debe tener un cliente"
                );
            }

            if (request.supplierId() != null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Una obligación por cobrar no puede tener proveedor"
                );
            }

            customer = getCustomer(
                    entityId,
                    request.customerId()
            );

        } else if (obligation.getType() == ObligationType.PAYABLE) {

            if (request.supplierId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Una obligación por pagar debe tener un proveedor"
                );
            }

            if (request.customerId() != null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Una obligación por pagar no puede tener cliente"
                );
            }

            supplier = getSupplier(
                    entityId,
                    request.supplierId()
            );
        }

        obligation.update(
                customer,
                supplier,
                request.issueDate(),
                request.dueDate(),
                request.description().trim(),
                normalize(request.reference()),
                request.totalAmount()
        );

        obligation.refreshStatus();

        return toResponse(obligation);
    }

    @Transactional
    public ObligationResponse voidObligation(
            UUID entityId,
            UUID obligationId,
            UUID ownerId
    ) {

        getAccountingEntity(
                entityId,
                ownerId
        );

        Obligation obligation =
                getObligation(
                        entityId,
                        obligationId
                );

        obligation.refreshStatus();

        if (obligation.getStatus() == ObligationStatus.VOIDED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La obligación ya está anulada"
            );
        }

        if (obligation.getStatus() == ObligationStatus.PAID
                || obligation.getPaidAmount().signum() > 0) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede anular una obligación que tiene pagos registrados"
            );
        }

        if (obligation.getJournalEntry() != null) {
            obligation.getJournalEntry()
                    .voidEntry();
        }

        obligation.voidObligation();

        return toResponse(obligation);
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

    private Customer getCustomer(
            UUID entityId,
            UUID customerId
    ) {

        return customerRepository
                .findByIdAndAccountingEntity_IdAndActiveTrue(
                        customerId,
                        entityId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cliente no encontrado"
                        )
                );
    }

    private Supplier getSupplier(
            UUID entityId,
            UUID supplierId
    ) {

        return supplierRepository
                .findByIdAndAccountingEntity_IdAndActiveTrue(
                        supplierId,
                        entityId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Proveedor no encontrado"
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

    private void validateAccountingAccounts(
            ObligationType type,
            Account obligationAccount,
            Account counterpartAccount
    ) {

        if (obligationAccount.getId()
                .equals(counterpartAccount.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cuenta de obligación y la cuenta contrapartida deben ser diferentes"
            );
        }

        if (type == ObligationType.PAYABLE) {

            if (obligationAccount.getType()
                    != AccountType.LIABILITY) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Una obligación por pagar debe utilizar una cuenta de tipo LIABILITY"
                );
            }

            if (counterpartAccount.getType()
                    != AccountType.EXPENSE
                    && counterpartAccount.getType()
                    != AccountType.ASSET) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La contrapartida de una obligación por pagar debe ser una cuenta EXPENSE o ASSET"
                );
            }

        } else if (type == ObligationType.RECEIVABLE) {

            if (obligationAccount.getType()
                    != AccountType.ASSET) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Una obligación por cobrar debe utilizar una cuenta de tipo ASSET"
                );
            }

            if (counterpartAccount.getType()
                    != AccountType.INCOME) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La contrapartida de una obligación por cobrar debe ser una cuenta de tipo INCOME"
                );
            }
        }
    }

    private void validateDates(
            LocalDate issueDate,
            LocalDate dueDate
    ) {

        if (issueDate == null || dueDate == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Las fechas de emisión y vencimiento son obligatorias"
            );
        }

        if (dueDate.isBefore(issueDate)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha de vencimiento no puede ser anterior a la fecha de emisión"
            );
        }
    }

    private ObligationResponse toResponse(
            Obligation obligation
    ) {

        UUID customerId =
                obligation.getCustomer() != null
                        ? obligation.getCustomer().getId()
                        : null;

        UUID supplierId =
                obligation.getSupplier() != null
                        ? obligation.getSupplier().getId()
                        : null;

        UUID obligationAccountId =
                obligation.getObligationAccount() != null
                        ? obligation.getObligationAccount().getId()
                        : null;

        UUID counterpartAccountId =
                obligation.getCounterpartAccount() != null
                        ? obligation.getCounterpartAccount().getId()
                        : null;

        UUID journalEntryId =
                obligation.getJournalEntry() != null
                        ? obligation.getJournalEntry().getId()
                        : null;

        return new ObligationResponse(
                obligation.getId(),
                obligation.getAccountingEntity().getId(),
                obligation.getType(),
                customerId,
                supplierId,
                obligation.getIssueDate(),
                obligation.getDueDate(),
                obligation.getDescription(),
                obligation.getReference(),
                obligation.getTotalAmount(),
                obligation.getPaidAmount(),
                obligation.getOutstandingAmount(),
                obligation.getStatus(),
                obligationAccountId,
                counterpartAccountId,
                journalEntryId
        );
    }

    private String normalize(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String normalized =
                value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}