package io.github.edwinbelduma.contacore.income.repository;

import io.github.edwinbelduma.contacore.income.domain.Income;
import io.github.edwinbelduma.contacore.income.domain.IncomeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncomeRepository extends JpaRepository<Income, UUID> {

    List<Income> findByAccountingEntity_IdOrderByIncomeDateDescCreatedAtDesc(
            UUID accountingEntityId
    );

    List<Income> findByAccountingEntity_IdAndStatusOrderByIncomeDateDescCreatedAtDesc(
            UUID accountingEntityId,
            IncomeStatus status
    );

    Optional<Income> findByIdAndAccountingEntity_Id(
            UUID id,
            UUID accountingEntityId
    );

    @Query("""
            SELECT i
            FROM Income i
            WHERE i.accountingEntity.id = :entityId
              AND (:status IS NULL OR i.status = :status)
              AND (:from IS NULL OR i.incomeDate >= :from)
              AND (:to IS NULL OR i.incomeDate <= :to)
            ORDER BY i.incomeDate DESC, i.createdAt DESC
            """)
    List<Income> search(
            @Param("entityId") UUID entityId,
            @Param("status") IncomeStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}