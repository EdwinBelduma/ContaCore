package io.github.edwinbelduma.contacore.accounting.journal.domain;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "journal_entry_lines")
public class JournalEntryLine extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journal_entry_id", nullable = false)
    private JournalEntry journalEntry;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "line_number", nullable = false)
    private int lineNumber;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal debit;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal credit;

    protected JournalEntryLine() {
    }

    public JournalEntryLine(
            JournalEntry journalEntry,
            Account account,
            int lineNumber,
            String description,
            BigDecimal debit,
            BigDecimal credit
    ) {
        this.journalEntry = journalEntry;
        this.account = account;
        this.lineNumber = lineNumber;
        this.description = description;
        this.debit = debit;
        this.credit = credit;
    }

    public JournalEntry getJournalEntry() {
        return journalEntry;
    }

    public Account getAccount() {
        return account;
    }

    public int getLineNumber() {
        return lineNumber;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getDebit() {
        return debit;
    }

    public BigDecimal getCredit() {
        return credit;
    }
}