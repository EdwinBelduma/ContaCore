package io.github.edwinbelduma.contacore.obligation.repository;

import io.github.edwinbelduma.contacore.obligation.domain.Obligation;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationStatus;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ObligationRepository
        extends JpaRepository<Obligation, UUID> {

    List<Obligation> findByAccountingEntity_IdOrderByDueDateAscCreatedAtDesc(
            UUID accountingEntityId
    );

    List<Obligation> findByAccountingEntity_IdAndTypeOrderByDueDateAscCreatedAtDesc(
            UUID accountingEntityId,
            ObligationType type
    );

    List<Obligation> findByAccountingEntity_IdAndStatusOrderByDueDateAscCreatedAtDesc(
            UUID accountingEntityId,
            ObligationStatus status
    );

    Optional<Obligation> findByIdAndAccountingEntity_Id(
            UUID id,
            UUID accountingEntityId
    );
}