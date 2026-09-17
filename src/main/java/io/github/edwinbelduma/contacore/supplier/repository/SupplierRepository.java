package io.github.edwinbelduma.contacore.supplier.repository;

import io.github.edwinbelduma.contacore.supplier.domain.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupplierRepository
        extends JpaRepository<Supplier, UUID> {

    List<Supplier> findByAccountingEntity_IdAndActiveTrueOrderByDisplayNameAsc(
            UUID accountingEntityId
    );

    Optional<Supplier> findByIdAndAccountingEntity_IdAndActiveTrue(
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