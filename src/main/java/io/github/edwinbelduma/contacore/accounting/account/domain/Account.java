package io.github.edwinbelduma.contacore.accounting.account.domain;

import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "accounts",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_accounts_entity_code",
                        columnNames = {
                                "accounting_entity_id",
                                "code"
                        }
                )
        }
)
public class Account extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "accounting_entity_id",
            nullable = false
    )
    private AccountingEntity accountingEntity;

    @Column(
            nullable = false,
            length = 30
    )
    private String code;

    @Column(
            nullable = false,
            length = 150
    )
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "account_type",
            nullable = false,
            length = 30
    )
    private AccountType type;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 10
    )
    private AccountNature nature;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_account_id")
    private Account parent;

    @Column(
            name = "allows_entries",
            nullable = false
    )
    private boolean allowsEntries;

    @Column(nullable = false)
    private boolean active;

    protected Account() {
    }

    public Account(
            AccountingEntity accountingEntity,
            String code,
            String name,
            AccountType type,
            AccountNature nature,
            Account parent,
            boolean allowsEntries
    ) {
        this.accountingEntity = accountingEntity;
        this.code = code;
        this.name = name;
        this.type = type;
        this.nature = nature;
        this.parent = parent;
        this.allowsEntries = allowsEntries;
        this.active = true;
    }

    public void update(
            String code,
            String name,
            AccountType type,
            AccountNature nature,
            Account parent,
            boolean allowsEntries
    ) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.nature = nature;
        this.parent = parent;
        this.allowsEntries = allowsEntries;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }

    public AccountingEntity getAccountingEntity() {
        return accountingEntity;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public AccountType getType() {
        return type;
    }

    public AccountNature getNature() {
        return nature;
    }

    public Account getParent() {
        return parent;
    }

    public boolean isAllowsEntries() {
        return allowsEntries;
    }

    public boolean isActive() {
        return active;
    }
}