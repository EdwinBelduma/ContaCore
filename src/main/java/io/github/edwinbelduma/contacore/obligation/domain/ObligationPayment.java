package io.github.edwinbelduma.contacore.obligation.domain;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntry;
import io.github.edwinbelduma.contacore.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "obligation_payments")
public class ObligationPayment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "obligation_id", nullable = false)
    private Obligation obligation;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cash_account_id", nullable = false)
    private Account cashAccount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ObligationPaymentStatus status;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id", unique = true)
    private JournalEntry journalEntry;

    protected ObligationPayment() {
    }

    public ObligationPayment(
            Obligation obligation,
            LocalDate paymentDate,
            BigDecimal amount,
            Account cashAccount
    ) {
        this.obligation = obligation;
        this.paymentDate = paymentDate;
        this.amount = amount;
        this.cashAccount = cashAccount;
        this.status = ObligationPaymentStatus.POSTED;
    }

    public void attachJournalEntry(JournalEntry journalEntry) {
        this.journalEntry = journalEntry;
    }

    public void voidPayment() {
        this.status = ObligationPaymentStatus.VOIDED;
    }

    public Obligation getObligation() {
        return obligation;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Account getCashAccount() {
        return cashAccount;
    }

    public ObligationPaymentStatus getStatus() {
        return status;
    }

    public JournalEntry getJournalEntry() {
        return journalEntry;
    }
}