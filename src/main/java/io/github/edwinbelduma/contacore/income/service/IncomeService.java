package io.github.edwinbelduma.contacore.income.service;

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
import io.github.edwinbelduma.contacore.income.domain.Income;
import io.github.edwinbelduma.contacore.income.domain.IncomeStatus;
import io.github.edwinbelduma.contacore.income.dto.CreateIncomeRequest;
import io.github.edwinbelduma.contacore.income.dto.IncomeResponse;
import io.github.edwinbelduma.contacore.income.dto.UpdateIncomeRequest;
import io.github.edwinbelduma.contacore.income.repository.IncomeRepository;
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
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final AccountingEntityRepository accountingEntityRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final UserRepository userRepository;

    public IncomeService(
            IncomeRepository incomeRepository,
            AccountingEntityRepository accountingEntityRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            JournalEntryRepository journalEntryRepository,
            UserRepository userRepository
    ) {
        this.incomeRepository = incomeRepository;
        this.accountingEntityRepository = accountingEntityRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public IncomeResponse create(
            UUID entityId,
            UUID ownerId,
            CreateIncomeRequest request
    ) {

        AccountingEntity accountingEntity =
                getAccountingEntity(entityId, ownerId);

        Customer customer =
                getCustomerIfPresent(
                        entityId,
                        request.customerId()
                );

        Account incomeAccount =
                getAccount(
                        entityId,
                        request.incomeAccountId()
                );

        Account receiptAccount =
                getAccount(
                        entityId,
                        request.receiptAccountId()
                );

        validateAccounts(
                incomeAccount,
                receiptAccount
        );

        Income income = new Income(
                accountingEntity,
                customer,
                request.incomeDate(),
                request.description().trim(),
                normalize(request.reference()),
                request.amount(),
                incomeAccount,
                receiptAccount
        );

        Income saved =
                incomeRepository.save(income);

        return toResponse(saved);
    }

    public List<IncomeResponse> findAll(
            UUID entityId,
            UUID ownerId
    ) {

        getAccountingEntity(entityId, ownerId);

        return incomeRepository
                .findByAccountingEntity_IdOrderByIncomeDateDescCreatedAtDesc(
                        entityId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public IncomeResponse findById(
            UUID entityId,
            UUID incomeId,
            UUID ownerId
    ) {

        getAccountingEntity(entityId, ownerId);

        Income income =
                getIncome(
                        entityId,
                        incomeId
                );

        return toResponse(income);
    }

    @Transactional
    public IncomeResponse update(
            UUID entityId,
            UUID incomeId,
            UUID ownerId,
            UpdateIncomeRequest request
    ) {

        getAccountingEntity(entityId, ownerId);

        Income income =
                getIncome(
                        entityId,
                        incomeId
                );

        if (income.getStatus() != IncomeStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden modificar ingresos en estado DRAFT"
            );
        }

        Customer customer =
                getCustomerIfPresent(
                        entityId,
                        request.customerId()
                );

        Account incomeAccount =
                getAccount(
                        entityId,
                        request.incomeAccountId()
                );

        Account receiptAccount =
                getAccount(
                        entityId,
                        request.receiptAccountId()
                );

        validateAccounts(
                incomeAccount,
                receiptAccount
        );

        income.update(
                customer,
                request.incomeDate(),
                request.description().trim(),
                normalize(request.reference()),
                request.amount(),
                incomeAccount,
                receiptAccount
        );

        return toResponse(income);
    }

    @Transactional
    public IncomeResponse post(
            UUID entityId,
            UUID incomeId,
            UUID ownerId
    ) {

        AccountingEntity accountingEntity =
                getAccountingEntity(
                        entityId,
                        ownerId
                );

        Income income =
                getIncome(
                        entityId,
                        incomeId
                );

        if (income.getStatus() != IncomeStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden contabilizar ingresos en estado DRAFT"
            );
        }

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
                        income.getIncomeDate(),
                        income.getDescription(),
                        income.getReference(),
                        user
                );

        JournalEntryLine debitLine =
                new JournalEntryLine(
                        journalEntry,
                        income.getReceiptAccount(),
                        1,
                        income.getDescription(),
                        income.getAmount(),
                        BigDecimal.ZERO
                );

        JournalEntryLine creditLine =
                new JournalEntryLine(
                        journalEntry,
                        income.getIncomeAccount(),
                        2,
                        income.getDescription(),
                        BigDecimal.ZERO,
                        income.getAmount()
                );

        journalEntry.addLine(debitLine);
        journalEntry.addLine(creditLine);

        journalEntry.post();

        JournalEntry savedJournalEntry =
                journalEntryRepository.save(journalEntry);

        income.post(savedJournalEntry);

        return toResponse(income);
    }

    @Transactional
    public IncomeResponse voidIncome(
            UUID entityId,
            UUID incomeId,
            UUID ownerId
    ) {

        getAccountingEntity(
                entityId,
                ownerId
        );

        Income income =
                getIncome(
                        entityId,
                        incomeId
                );

        if (income.getStatus() != IncomeStatus.POSTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden anular ingresos en estado POSTED"
            );
        }

        if (income.getJournalEntry() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El ingreso no tiene un asiento contable asociado"
            );
        }

        income.getJournalEntry().voidEntry();

        income.voidIncome();

        return toResponse(income);
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

    private Income getIncome(
            UUID entityId,
            UUID incomeId
    ) {

        return incomeRepository
                .findByIdAndAccountingEntity_Id(
                        incomeId,
                        entityId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Ingreso no encontrado"
                        )
                );
    }

    private Customer getCustomerIfPresent(
            UUID entityId,
            UUID customerId
    ) {

        if (customerId == null) {
            return null;
        }

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
            Account incomeAccount,
            Account receiptAccount
    ) {

        if (incomeAccount.getType() != AccountType.INCOME) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cuenta del ingreso debe ser de tipo INCOME"
            );
        }

        if (receiptAccount.getType() != AccountType.ASSET) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cuenta de recepción debe ser de tipo ASSET"
            );
        }

        if (incomeAccount
                .getId()
                .equals(receiptAccount.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cuenta de ingreso y la cuenta de recepción deben ser diferentes"
            );
        }
    }

    private IncomeResponse toResponse(
            Income income
    ) {

        UUID customerId =
                income.getCustomer() != null
                        ? income.getCustomer().getId()
                        : null;

        UUID journalEntryId =
                income.getJournalEntry() != null
                        ? income.getJournalEntry().getId()
                        : null;

        return new IncomeResponse(
                income.getId(),
                income.getAccountingEntity().getId(),
                customerId,
                income.getIncomeDate(),
                income.getDescription(),
                income.getReference(),
                income.getAmount(),
                income.getIncomeAccount().getId(),
                income.getReceiptAccount().getId(),
                income.getStatus(),
                journalEntryId
        );
    }

    private String normalize(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}