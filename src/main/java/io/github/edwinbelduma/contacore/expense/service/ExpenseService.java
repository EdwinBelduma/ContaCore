package io.github.edwinbelduma.contacore.expense.service;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.account.domain.AccountType;
import io.github.edwinbelduma.contacore.accounting.account.repository.AccountRepository;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntry;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryLine;
import io.github.edwinbelduma.contacore.accounting.journal.repository.JournalEntryRepository;
import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.accountingentity.repository.AccountingEntityRepository;
import io.github.edwinbelduma.contacore.expense.domain.Expense;
import io.github.edwinbelduma.contacore.expense.domain.ExpenseStatus;
import io.github.edwinbelduma.contacore.expense.dto.CreateExpenseRequest;
import io.github.edwinbelduma.contacore.expense.dto.ExpenseResponse;
import io.github.edwinbelduma.contacore.expense.dto.UpdateExpenseRequest;
import io.github.edwinbelduma.contacore.expense.repository.ExpenseRepository;
import io.github.edwinbelduma.contacore.supplier.domain.Supplier;
import io.github.edwinbelduma.contacore.supplier.repository.SupplierRepository;
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
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final AccountingEntityRepository accountingEntityRepository;
    private final SupplierRepository supplierRepository;
    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final UserRepository userRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            AccountingEntityRepository accountingEntityRepository,
            SupplierRepository supplierRepository,
            AccountRepository accountRepository,
            JournalEntryRepository journalEntryRepository,
            UserRepository userRepository
    ) {
        this.expenseRepository = expenseRepository;
        this.accountingEntityRepository = accountingEntityRepository;
        this.supplierRepository = supplierRepository;
        this.accountRepository = accountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ExpenseResponse create(
            UUID entityId,
            UUID ownerId,
            CreateExpenseRequest request
    ) {

        AccountingEntity accountingEntity =
                getAccountingEntity(entityId, ownerId);

        Supplier supplier =
                getSupplierIfPresent(
                        entityId,
                        request.supplierId()
                );

        Account expenseAccount =
                getAccount(
                        entityId,
                        request.expenseAccountId()
                );

        Account paymentAccount =
                getAccount(
                        entityId,
                        request.paymentAccountId()
                );

        validateAccounts(
                expenseAccount,
                paymentAccount
        );

        Expense expense = new Expense(
                accountingEntity,
                supplier,
                request.expenseDate(),
                request.description().trim(),
                normalize(request.reference()),
                request.amount(),
                expenseAccount,
                paymentAccount
        );

        Expense saved =
                expenseRepository.save(expense);

        return toResponse(saved);
    }

    public List<ExpenseResponse> findAll(
            UUID entityId,
            UUID ownerId
    ) {

        getAccountingEntity(entityId, ownerId);

        return expenseRepository
                .findByAccountingEntity_IdOrderByExpenseDateDescCreatedAtDesc(
                        entityId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ExpenseResponse findById(
            UUID entityId,
            UUID expenseId,
            UUID ownerId
    ) {

        getAccountingEntity(entityId, ownerId);

        Expense expense =
                getExpense(
                        entityId,
                        expenseId
                );

        return toResponse(expense);
    }

    @Transactional
    public ExpenseResponse update(
            UUID entityId,
            UUID expenseId,
            UUID ownerId,
            UpdateExpenseRequest request
    ) {

        getAccountingEntity(entityId, ownerId);

        Expense expense =
                getExpense(
                        entityId,
                        expenseId
                );

        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden modificar gastos en estado DRAFT"
            );
        }

        Supplier supplier =
                getSupplierIfPresent(
                        entityId,
                        request.supplierId()
                );

        Account expenseAccount =
                getAccount(
                        entityId,
                        request.expenseAccountId()
                );

        Account paymentAccount =
                getAccount(
                        entityId,
                        request.paymentAccountId()
                );

        validateAccounts(
                expenseAccount,
                paymentAccount
        );

        expense.update(
                supplier,
                request.expenseDate(),
                request.description().trim(),
                normalize(request.reference()),
                request.amount(),
                expenseAccount,
                paymentAccount
        );

        return toResponse(expense);
    }

    @Transactional
    public ExpenseResponse post(
            UUID entityId,
            UUID expenseId,
            UUID ownerId
    ) {

        AccountingEntity accountingEntity =
                getAccountingEntity(
                        entityId,
                        ownerId
                );

        Expense expense =
                getExpense(
                        entityId,
                        expenseId
                );

        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden contabilizar gastos en estado DRAFT"
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
                        expense.getExpenseDate(),
                        expense.getDescription(),
                        expense.getReference(),
                        user
                );

        JournalEntryLine debitLine =
                new JournalEntryLine(
                        journalEntry,
                        expense.getExpenseAccount(),
                        1,
                        expense.getDescription(),
                        expense.getAmount(),
                        BigDecimal.ZERO
                );

        JournalEntryLine creditLine =
                new JournalEntryLine(
                        journalEntry,
                        expense.getPaymentAccount(),
                        2,
                        expense.getDescription(),
                        BigDecimal.ZERO,
                        expense.getAmount()
                );

        journalEntry.addLine(debitLine);
        journalEntry.addLine(creditLine);

        journalEntry.post();

        JournalEntry savedJournalEntry =
                journalEntryRepository.save(
                        journalEntry
                );

        expense.post(savedJournalEntry);

        return toResponse(expense);
    }

    @Transactional
    public ExpenseResponse voidExpense(
            UUID entityId,
            UUID expenseId,
            UUID ownerId
    ) {

        getAccountingEntity(
                entityId,
                ownerId
        );

        Expense expense =
                getExpense(
                        entityId,
                        expenseId
                );

        if (expense.getStatus() != ExpenseStatus.POSTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden anular gastos en estado POSTED"
            );
        }

        if (expense.getJournalEntry() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El gasto no tiene un asiento contable asociado"
            );
        }

        expense.getJournalEntry()
                .voidEntry();

        expense.voidExpense();

        return toResponse(expense);
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

    private Expense getExpense(
            UUID entityId,
            UUID expenseId
    ) {

        return expenseRepository
                .findByIdAndAccountingEntity_Id(
                        expenseId,
                        entityId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Gasto no encontrado"
                        )
                );
    }

    private Supplier getSupplierIfPresent(
            UUID entityId,
            UUID supplierId
    ) {

        if (supplierId == null) {
            return null;
        }

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

    private void validateAccounts(
            Account expenseAccount,
            Account paymentAccount
    ) {

        if (expenseAccount.getType() != AccountType.EXPENSE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cuenta del gasto debe ser de tipo EXPENSE"
            );
        }

        if (paymentAccount.getType() != AccountType.ASSET) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cuenta de pago debe ser de tipo ASSET"
            );
        }

        if (expenseAccount
                .getId()
                .equals(paymentAccount.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cuenta de gasto y la cuenta de pago deben ser diferentes"
            );
        }
    }

    private ExpenseResponse toResponse(
            Expense expense
    ) {

        UUID supplierId =
                expense.getSupplier() != null
                        ? expense.getSupplier().getId()
                        : null;

        UUID journalEntryId =
                expense.getJournalEntry() != null
                        ? expense.getJournalEntry().getId()
                        : null;

        return new ExpenseResponse(
                expense.getId(),
                expense.getAccountingEntity().getId(),
                supplierId,
                expense.getExpenseDate(),
                expense.getDescription(),
                expense.getReference(),
                expense.getAmount(),
                expense.getExpenseAccount().getId(),
                expense.getPaymentAccount().getId(),
                expense.getStatus(),
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