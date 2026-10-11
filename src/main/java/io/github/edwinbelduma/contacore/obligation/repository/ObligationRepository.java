package io.github.edwinbelduma.contacore.obligation.repository;

import io.github.edwinbelduma.contacore.obligation.domain.Obligation;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationStatus;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ObligationRepository
        extends JpaRepository<Obligation, UUID> {

    List<Obligation> findByAccountingEntity_IdOrderByDueDateAscCreatedAtDesc(
            UUID entityId
    );

    List<Obligation> findByAccountingEntity_IdAndTypeOrderByDueDateAscCreatedAtDesc(
            UUID entityId,
            ObligationType type
    );

    List<Obligation> findByAccountingEntity_IdAndStatusOrderByDueDateAscCreatedAtDesc(
            UUID entityId,
            ObligationStatus status
    );

    Optional<Obligation> findByIdAndAccountingEntity_Id(
            UUID id,
            UUID entityId
    );

    @Query("""
            SELECT o
            FROM Obligation o
            WHERE o.accountingEntity.id = :entityId
              AND (:type IS NULL OR o.type = :type)
              AND (:dueFrom IS NULL OR o.dueDate >= :dueFrom)
              AND (:dueTo IS NULL OR o.dueDate <= :dueTo)
            ORDER BY o.dueDate ASC, o.createdAt DESC
            """)
    List<Obligation> search(
            @Param("entityId") UUID entityId,
            @Param("type") ObligationType type,
            @Param("dueFrom") LocalDate dueFrom,
            @Param("dueTo") LocalDate dueTo
    );
}