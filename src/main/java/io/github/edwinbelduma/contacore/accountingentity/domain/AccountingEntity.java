package io.github.edwinbelduma.contacore.accountingentity.domain;

import io.github.edwinbelduma.contacore.shared.domain.BaseEntity;
import io.github.edwinbelduma.contacore.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "accounting_entities")
public class AccountingEntity extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 40)
    private AccountingEntityType type;

    @Column(name = "display_name", nullable = false, length = 150)
    private String displayName;

    @Column(name = "legal_name", length = 200)
    private String legalName;

    @Column(name = "tax_identifier", unique = true, length = 30)
    private String taxIdentifier;

    @Column(name = "country_code", nullable = false, length = 2)
    private String countryCode;

    @Column(nullable = false)
    private boolean active;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private User owner;

    protected AccountingEntity() {
    }

    public AccountingEntity(
            AccountingEntityType type,
            String displayName,
            String legalName,
            String taxIdentifier,
            User owner
    ) {
        this.type = type;
        this.displayName = displayName;
        this.legalName = legalName;
        this.taxIdentifier = taxIdentifier;
        this.owner = owner;
        this.countryCode = "EC";
        this.active = true;
    }

    public void update(
            AccountingEntityType type,
            String displayName,
            String legalName,
            String taxIdentifier
    ) {
        this.type = type;
        this.displayName = displayName;
        this.legalName = legalName;
        this.taxIdentifier = taxIdentifier;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }

    public AccountingEntityType getType() {
        return type;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getLegalName() {
        return legalName;
    }

    public String getTaxIdentifier() {
        return taxIdentifier;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public boolean isActive() {
        return active;
    }

    public User getOwner() {
        return owner;
    }
}