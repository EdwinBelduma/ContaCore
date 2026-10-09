package io.github.edwinbelduma.contacore.income.domain;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntry;
import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.customer.domain.Customer;
import io.github.edwinbelduma.contacore.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "incomes")
public class Income extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "accounting_entity_id",
            nullable = false
    )
    private AccountingEntity accountingEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(
            name = "income_date",
            nullable = false
    )
    private LocalDate incomeDate;

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
            name = "income_account_id",
            nullable = false
    )
    private Account incomeAccount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "receipt_account_id",
            nullable = false
    )
    private Account receiptAccount;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private IncomeStatus status;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "journal_entry_id",
            unique = true
    )
    private JournalEntry journalEntry;

    protected Income() {
    }

    public Income(
            AccountingEntity accountingEntity,
            Customer customer,
            LocalDate incomeDate,
            String description,
            String reference,
            BigDecimal amount,
            Account incomeAccount,
            Account receiptAccount
    ) {
        this.accountingEntity = accountingEntity;
        this.customer = customer;
        this.incomeDate = incomeDate;
        this.description = description;
        this.reference = reference;
        this.amount = amount;
        this.incomeAccount = incomeAccount;
        this.receiptAccount = receiptAccount;
        this.status = IncomeStatus.DRAFT;
    }

    public void update(
            Customer customer,
            LocalDate incomeDate,
            String description,
            String reference,
            BigDecimal amount,
            Account incomeAccount,
            Account receiptAccount
    ) {
        this.customer = customer;
        this.incomeDate = incomeDate;
        this.description = description;
        this.reference = reference;
        this.amount = amount;
        this.incomeAccount = incomeAccount;
        this.receiptAccount = receiptAccount;
    }

    public void post(JournalEntry journalEntry) {
        this.journalEntry = journalEntry;
        this.status = IncomeStatus.POSTED;
    }

    public void voidIncome() {
        this.status = IncomeStatus.VOIDED;
    }

    public AccountingEntity getAccountingEntity() {
        return accountingEntity;
    }

    public Customer getCustomer() {
        return customer;
    }

    public LocalDate getIncomeDate() {
        return incomeDate;
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

    public Account getIncomeAccount() {
        return incomeAccount;
    }

    public Account getReceiptAccount() {
        return receiptAccount;
    }

    public IncomeStatus getStatus() {
        return status;
    }

    public JournalEntry getJournalEntry() {
        return journalEntry;
    }
}