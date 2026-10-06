package io.github.edwinbelduma.contacore.expense.domain;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntry;
import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.shared.domain.BaseEntity;
import io.github.edwinbelduma.contacore.supplier.domain.Supplier;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "accounting_entity_id",
            nullable = false
    )
    private AccountingEntity accountingEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(
            name = "expense_date",
            nullable = false
    )
    private LocalDate expenseDate;

    @Column(
            nullable = false,
            length = 255
    )
    private String description;

    @Column(length = 100)
    private String reference;

    @Column(
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "expense_account_id",
            nullable = false
    )
    private Account expenseAccount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "payment_account_id",
            nullable = false
    )
    private Account paymentAccount;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private ExpenseStatus status;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "journal_entry_id",
            unique = true
    )
    private JournalEntry journalEntry;

    protected Expense() {
    }

    public Expense(
            AccountingEntity accountingEntity,
            Supplier supplier,
            LocalDate expenseDate,
            String description,
            String reference,
            BigDecimal amount,
            Account expenseAccount,
            Account paymentAccount
    ) {
        this.accountingEntity = accountingEntity;
        this.supplier = supplier;
        this.expenseDate = expenseDate;
        this.description = description;
        this.reference = reference;
        this.amount = amount;
        this.expenseAccount = expenseAccount;
        this.paymentAccount = paymentAccount;
        this.status = ExpenseStatus.DRAFT;
    }

    public void update(
            Supplier supplier,
            LocalDate expenseDate,
            String description,
            String reference,
            BigDecimal amount,
            Account expenseAccount,
            Account paymentAccount
    ) {
        this.supplier = supplier;
        this.expenseDate = expenseDate;
        this.description = description;
        this.reference = reference;
        this.amount = amount;
        this.expenseAccount = expenseAccount;
        this.paymentAccount = paymentAccount;
    }

    public void post(JournalEntry journalEntry) {
        this.journalEntry = journalEntry;
        this.status = ExpenseStatus.POSTED;
    }

    public void voidExpense() {
        this.status = ExpenseStatus.VOIDED;
    }

    public AccountingEntity getAccountingEntity() {
        return accountingEntity;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public String getDescription() {
        return description;
    }

    public String getReference() {
        return reference;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Account getExpenseAccount() {
        return expenseAccount;
    }

    public Account getPaymentAccount() {
        return paymentAccount;
    }

    public ExpenseStatus getStatus() {
        return status;
    }

    public JournalEntry getJournalEntry() {
        return journalEntry;
    }
}