package io.github.edwinbelduma.contacore.dashboard.service;

import io.github.edwinbelduma.contacore.accounting.account.domain.AccountType;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryLine;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryStatus;
import io.github.edwinbelduma.contacore.accounting.journal.repository.JournalEntryLineRepository;
import io.github.edwinbelduma.contacore.accountingentity.repository.AccountingEntityRepository;
import io.github.edwinbelduma.contacore.dashboard.dto.DashboardRecentMovementResponse;
import io.github.edwinbelduma.contacore.dashboard.dto.DashboardSummaryResponse;
import io.github.edwinbelduma.contacore.expense.domain.ExpenseStatus;
import io.github.edwinbelduma.contacore.expense.repository.ExpenseRepository;
import io.github.edwinbelduma.contacore.income.domain.IncomeStatus;
import io.github.edwinbelduma.contacore.income.repository.IncomeRepository;
import io.github.edwinbelduma.contacore.obligation.domain.Obligation;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationStatus;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationType;
import io.github.edwinbelduma.contacore.obligation.repository.ObligationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final AccountingEntityRepository accountingEntityRepository;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final ObligationRepository obligationRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;

    public DashboardService(
            AccountingEntityRepository accountingEntityRepository,
            IncomeRepository incomeRepository,
            ExpenseRepository expenseRepository,
            ObligationRepository obligationRepository,
            JournalEntryLineRepository journalEntryLineRepository
    ) {
        this.accountingEntityRepository = accountingEntityRepository;
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.obligationRepository = obligationRepository;
        this.journalEntryLineRepository = journalEntryLineRepository;
    }

    @Transactional
    public DashboardSummaryResponse getSummary(
            UUID entityId,
            UUID ownerId
    ) {

        validateAccountingEntity(
                entityId,
                ownerId
        );

        List<JournalEntryLine> accountingLines =
                journalEntryLineRepository
                        .findAllByEntityAndStatus(
                                entityId,
                                JournalEntryStatus.POSTED
                        );

        BigDecimal totalIncome =
                accountingLines
                        .stream()
                        .filter(line ->
                                line.getAccount().getType()
                                        == AccountType.INCOME
                        )
                        .map(line ->
                                line.getCredit()
                                        .subtract(line.getDebit())
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalExpenses =
                accountingLines
                        .stream()
                        .filter(line ->
                                line.getAccount().getType()
                                        == AccountType.EXPENSE
                        )
                        .map(line ->
                                line.getDebit()
                                        .subtract(line.getCredit())
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal netResult =
                totalIncome.subtract(totalExpenses);

        List<Obligation> obligations =
                obligationRepository
                        .findByAccountingEntity_IdOrderByDueDateAscCreatedAtDesc(
                                entityId
                        );

        obligations.forEach(Obligation::refreshStatus);

        BigDecimal totalReceivable =
                obligations
                        .stream()
                        .filter(obligation ->
                                obligation.getType()
                                        == ObligationType.RECEIVABLE
                        )
                        .filter(obligation ->
                                obligation.getStatus()
                                        != ObligationStatus.VOIDED
                        )
                        .map(Obligation::getOutstandingAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalPayable =
                obligations
                        .stream()
                        .filter(obligation ->
                                obligation.getType()
                                        == ObligationType.PAYABLE
                        )
                        .filter(obligation ->
                                obligation.getStatus()
                                        != ObligationStatus.VOIDED
                        )
                        .map(Obligation::getOutstandingAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        long overdueObligations =
                obligations
                        .stream()
                        .filter(obligation ->
                                obligation.getStatus()
                                        == ObligationStatus.OVERDUE
                        )
                        .count();

        return new DashboardSummaryResponse(
                totalIncome,
                totalExpenses,
                netResult,
                totalReceivable,
                totalPayable,
                overdueObligations
        );
    }

    public List<DashboardRecentMovementResponse> getRecentMovements(
            UUID entityId,
            UUID ownerId
    ) {

        validateAccountingEntity(
                entityId,
                ownerId
        );

        Stream<DashboardRecentMovementResponse> incomes =
                incomeRepository
                        .findByAccountingEntity_IdAndStatusOrderByIncomeDateDescCreatedAtDesc(
                                entityId,
                                IncomeStatus.POSTED
                        )
                        .stream()
                        .map(income ->
                                new DashboardRecentMovementResponse(
                                        income.getId(),
                                        "INCOME",
                                        income.getIncomeDate(),
                                        income.getDescription(),
                                        income.getReference(),
                                        income.getAmount()
                                )
                        );

        Stream<DashboardRecentMovementResponse> expenses =
                expenseRepository
                        .findByAccountingEntity_IdAndStatusOrderByExpenseDateDescCreatedAtDesc(
                                entityId,
                                ExpenseStatus.POSTED
                        )
                        .stream()
                        .map(expense ->
                                new DashboardRecentMovementResponse(
                                        expense.getId(),
                                        "EXPENSE",
                                        expense.getExpenseDate(),
                                        expense.getDescription(),
                                        expense.getReference(),
                                        expense.getAmount()
                                )
                        );

        return Stream
                .concat(incomes, expenses)
                .sorted(
                        Comparator.comparing(
                                DashboardRecentMovementResponse::date
                        ).reversed()
                )
                .limit(10)
                .toList();
    }

    private void validateAccountingEntity(
            UUID entityId,
            UUID ownerId
    ) {

        accountingEntityRepository
                .findByIdAndOwner_IdAndActiveTrue(
                        entityId,
                        ownerId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Entidad contable no encontrada"
                        )
                );
    }
}