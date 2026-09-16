package io.github.edwinbelduma.contacore.accounting.journal.domain;

import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.shared.domain.BaseEntity;
import io.github.edwinbelduma.contacore.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "journal_entries")
public class JournalEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "accounting_entity_id", nullable = false)
    private AccountingEntity accountingEntity;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(length = 100)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JournalEntryStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @OneToMany(
            mappedBy = "journalEntry",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("lineNumber ASC")
    private List<JournalEntryLine> lines = new ArrayList<>();

    protected JournalEntry() {
    }

    public JournalEntry(
            AccountingEntity accountingEntity,
            LocalDate entryDate,
            String description,
            String reference,
            User createdBy
    ) {
        this.accountingEntity = accountingEntity;
        this.entryDate = entryDate;
        this.description = description;
        this.reference = reference;
        this.createdBy = createdBy;
        this.status = JournalEntryStatus.DRAFT;
    }

    public void addLine(JournalEntryLine line) {
        lines.add(line);
    }

    public void post() {
        this.status = JournalEntryStatus.POSTED;
    }

    public void voidEntry() {
        this.status = JournalEntryStatus.VOIDED;
    }

    public AccountingEntity getAccountingEntity() {
        return accountingEntity;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public String getDescription() {
        return description;
    }

    public String getReference() {
        return reference;
    }

    public JournalEntryStatus getStatus() {
        return status;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public List<JournalEntryLine> getLines() {
        return Collections.unmodifiableList(lines);
    }
}