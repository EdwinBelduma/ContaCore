package io.github.edwinbelduma.contacore.obligation.domain;

import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.customer.domain.Customer;
import io.github.edwinbelduma.contacore.shared.domain.BaseEntity;
import io.github.edwinbelduma.contacore.supplier.domain.Supplier;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "obligations")
public class Obligation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "accounting_entity_id", nullable = false)
    private AccountingEntity accountingEntity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ObligationType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(length = 100)
    private String reference;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal paidAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ObligationStatus status;

    protected Obligation() {
    }

    public Obligation(
            AccountingEntity accountingEntity,
            ObligationType type,
            Customer customer,
            Supplier supplier,
            LocalDate issueDate,
            LocalDate dueDate,
            String description,
            String reference,
            BigDecimal totalAmount
    ) {
        this.accountingEntity = accountingEntity;
        this.type = type;
        this.customer = customer;
        this.supplier = supplier;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.description = description;
        this.reference = reference;
        this.totalAmount = totalAmount;
        this.paidAmount = BigDecimal.ZERO;
        this.status = ObligationStatus.PENDING;
    }

    public void update(
            Customer customer,
            Supplier supplier,
            LocalDate issueDate,
            LocalDate dueDate,
            String description,
            String reference,
            BigDecimal totalAmount
    ) {
        this.customer = customer;
        this.supplier = supplier;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.description = description;
        this.reference = reference;
        this.totalAmount = totalAmount;
    }

    public void registerPayment(BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "El valor del pago debe ser mayor que cero"
            );
        }

        BigDecimal newPaidAmount =
                this.paidAmount.add(amount);

        if (newPaidAmount.compareTo(this.totalAmount) > 0) {
            throw new IllegalArgumentException(
                    "El pago no puede superar el saldo pendiente"
            );
        }

        this.paidAmount = newPaidAmount;

        if (this.paidAmount.compareTo(this.totalAmount) == 0) {
            this.status = ObligationStatus.PAID;
        } else {
            this.status = ObligationStatus.PARTIALLY_PAID;
        }
    }

    public void markOverdue() {

        if (status == ObligationStatus.PENDING
                || status == ObligationStatus.PARTIALLY_PAID) {

            this.status = ObligationStatus.OVERDUE;
        }
    }

    public void voidObligation() {
        this.status = ObligationStatus.VOIDED;
    }

    public BigDecimal getOutstandingAmount() {
        return totalAmount.subtract(paidAmount);
    }

    public AccountingEntity getAccountingEntity() {
        return accountingEntity;
    }

    public ObligationType getType() {
        return type;
    }

    public Customer getCustomer() {
        return customer;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public String getDescription() {
        return description;
    }

    public String getReference() {
        return reference;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public ObligationStatus getStatus() {
        return status;
    }
}