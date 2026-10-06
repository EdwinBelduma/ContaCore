package io.github.edwinbelduma.contacore.expense.repository;

import io.github.edwinbelduma.contacore.expense.domain.Expense;
import io.github.edwinbelduma.contacore.expense.domain.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

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
}