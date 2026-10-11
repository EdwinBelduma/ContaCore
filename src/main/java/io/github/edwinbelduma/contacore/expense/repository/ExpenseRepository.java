package io.github.edwinbelduma.contacore.expense.repository;

import io.github.edwinbelduma.contacore.expense.domain.Expense;
import io.github.edwinbelduma.contacore.expense.domain.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByAccountingEntity_IdOrderByExpenseDateDescCreatedAtDesc(
            UUID accountingEntityId
    );

    List<Expense> findByAccountingEntity_IdAndStatusOrderByExpenseDateDescCreatedAtDesc(
            UUID accountingEntityId,
            ExpenseStatus status
    );

    Optional<Expense> findByIdAndAccountingEntity_Id(
            UUID id,
            UUID accountingEntityId
    );

    @Query("""
            SELECT e
            FROM Expense e
            WHERE e.accountingEntity.id = :entityId
              AND (:status IS NULL OR e.status = :status)
              AND (:from IS NULL OR e.expenseDate >= :from)
              AND (:to IS NULL OR e.expenseDate <= :to)
            ORDER BY e.expenseDate DESC, e.createdAt DESC
            """)
    List<Expense> search(
            @Param("entityId") UUID entityId,
            @Param("status") ExpenseStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}