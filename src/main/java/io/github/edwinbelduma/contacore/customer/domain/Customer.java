package io.github.edwinbelduma.contacore.customer.domain;

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
        name = "customers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_customers_entity_tax_identifier",
                        columnNames = {
                                "accounting_entity_id",
                                "tax_identifier"
                        }
                )
        }
)
public class Customer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "accounting_entity_id",
            nullable = false
    )
    private AccountingEntity accountingEntity;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "customer_type",
            nullable = false,
            length = 30
    )
    private CustomerType type;

    @Column(
            name = "display_name",
            nullable = false,
            length = 180
    )
    private String displayName;

    @Column(
            name = "tax_identifier",
            length = 30
    )
    private String taxIdentifier;

    @Column(
            length = 180
    )
    private String email;

    @Column(
            length = 30
    )
    private String phone;

    @Column(
            length = 255
    )
    private String address;

    @Column(nullable = false)
    private boolean active;

    protected Customer() {
    }

    public Customer(
            AccountingEntity accountingEntity,
            CustomerType type,
            String displayName,
            String taxIdentifier,
            String email,
            String phone,
            String address
    ) {
        this.accountingEntity = accountingEntity;
        this.type = type;
        this.displayName = displayName;
        this.taxIdentifier = taxIdentifier;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.active = true;
    }

    public void update(
            CustomerType type,
            String displayName,
            String taxIdentifier,
            String email,
            String phone,
            String address
    ) {
        this.type = type;
        this.displayName = displayName;
        this.taxIdentifier = taxIdentifier;
        this.email = email;
        this.phone = phone;
        this.address = address;
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

    public CustomerType getType() {
        return type;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getTaxIdentifier() {
        return taxIdentifier;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public boolean isActive() {
        return active;
    }
}