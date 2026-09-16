package io.github.edwinbelduma.contacore.accountingentity.repository;

import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountingEntityRepository
        extends JpaRepository<AccountingEntity, UUID> {

    List<AccountingEntity> findByOwner_IdAndActiveTrue(
            UUID ownerId
    );

    Optional<AccountingEntity> findByIdAndOwner_IdAndActiveTrue(
            UUID id,
            UUID ownerId
    );

    boolean existsByTaxIdentifier(
            String taxIdentifier
    );

    boolean existsByTaxIdentifierAndIdNot(
            String taxIdentifier,
            UUID id
    );
}