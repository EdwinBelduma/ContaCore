package io.github.edwinbelduma.contacore.customer.repository;

import io.github.edwinbelduma.contacore.customer.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository
        extends JpaRepository<Customer, UUID> {

    List<Customer> findByAccountingEntity_IdAndActiveTrueOrderByDisplayNameAsc(
            UUID accountingEntityId
    );

    Optional<Customer> findByIdAndAccountingEntity_IdAndActiveTrue(
            UUID id,
            UUID accountingEntityId
    );

    boolean existsByAccountingEntity_IdAndTaxIdentifier(
            UUID accountingEntityId,
            String taxIdentifier
    );

    boolean existsByAccountingEntity_IdAndTaxIdentifierAndIdNot(
            UUID accountingEntityId,
            String taxIdentifier,
            UUID id
    );
}