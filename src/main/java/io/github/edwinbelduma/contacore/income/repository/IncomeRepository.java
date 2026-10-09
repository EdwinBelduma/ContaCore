package io.github.edwinbelduma.contacore.income.repository;

import io.github.edwinbelduma.contacore.income.domain.Income;
import io.github.edwinbelduma.contacore.income.domain.IncomeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

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
}