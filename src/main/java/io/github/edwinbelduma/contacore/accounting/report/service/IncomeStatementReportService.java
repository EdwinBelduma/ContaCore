package io.github.edwinbelduma.contacore.accounting.report.service;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.account.domain.AccountType;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryLine;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryStatus;
import io.github.edwinbelduma.contacore.accounting.journal.repository.JournalEntryLineRepository;
import io.github.edwinbelduma.contacore.accounting.report.dto.IncomeStatementAccountResponse;
import io.github.edwinbelduma.contacore.accounting.report.dto.IncomeStatementReportResponse;
import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.accountingentity.repository.AccountingEntityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class IncomeStatementReportService {

    private final JournalEntryLineRepository journalEntryLineRepository;
    private final AccountingEntityRepository accountingEntityRepository;

    public IncomeStatementReportService(
            JournalEntryLineRepository journalEntryLineRepository,
            AccountingEntityRepository accountingEntityRepository
    ) {
        this.journalEntryLineRepository =
                journalEntryLineRepository;

        this.accountingEntityRepository =
                accountingEntityRepository;
    }

    @Transactional(readOnly = true)
    public IncomeStatementReportResponse generate(
            Jwt jwt,
            UUID entityId,
            LocalDate from,
            LocalDate to
    ) {

        if (from.isAfter(to)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha inicial no puede ser posterior a la fecha final"
            );
        }

        UUID userId = getUserId(jwt);

        AccountingEntity accountingEntity =
                accountingEntityRepository
                        .findByIdAndOwner_IdAndActiveTrue(
                                entityId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Entidad contable no encontrada"
                                )
                        );

        List<JournalEntryLine> lines =
                journalEntryLineRepository
                        .findAllBetweenDates(
                                entityId,
                                JournalEntryStatus.POSTED,
                                from,
                                to
                        );

        Map<UUID, AccountAccumulator> incomeMap =
                new LinkedHashMap<>();

        Map<UUID, AccountAccumulator> expenseMap =
                new LinkedHashMap<>();

        for (JournalEntryLine line : lines) {

            Account account = line.getAccount();

            if (account.getType() == AccountType.INCOME) {

                AccountAccumulator accumulator =
                        incomeMap.computeIfAbsent(
                                account.getId(),
                                id -> new AccountAccumulator(account)
                        );

                accumulator.add(line);
            }

            if (account.getType() == AccountType.EXPENSE) {

                AccountAccumulator accumulator =
                        expenseMap.computeIfAbsent(
                                account.getId(),
                                id -> new AccountAccumulator(account)
                        );

                accumulator.add(line);
            }
        }

        List<IncomeStatementAccountResponse> incomeAccounts =
                new ArrayList<>();

        BigDecimal totalIncome =
                BigDecimal.ZERO;

        for (AccountAccumulator accumulator
                : incomeMap.values()) {

            BigDecimal amount =
                    accumulator.totalCredit.subtract(
                            accumulator.totalDebit
                    );

            incomeAccounts.add(
                    new IncomeStatementAccountResponse(
                            accumulator.account.getId(),
                            accumulator.account.getCode(),
                            accumulator.account.getName(),
                            accumulator.account.getType(),
                            amount
                    )
            );

            totalIncome =
                    totalIncome.add(amount);
        }

        List<IncomeStatementAccountResponse> expenseAccounts =
                new ArrayList<>();

        BigDecimal totalExpenses =
                BigDecimal.ZERO;

        for (AccountAccumulator accumulator
                : expenseMap.values()) {

            BigDecimal amount =
                    accumulator.totalDebit.subtract(
                            accumulator.totalCredit
                    );

            expenseAccounts.add(
                    new IncomeStatementAccountResponse(
                            accumulator.account.getId(),
                            accumulator.account.getCode(),
                            accumulator.account.getName(),
                            accumulator.account.getType(),
                            amount
                    )
            );

            totalExpenses =
                    totalExpenses.add(amount);
        }

        BigDecimal netResult =
                totalIncome.subtract(totalExpenses);

        return new IncomeStatementReportResponse(
                accountingEntity.getId(),
                accountingEntity.getDisplayName(),
                from,
                to,
                incomeAccounts,
                expenseAccounts,
                totalIncome,
                totalExpenses,
                netResult
        );
    }

    private UUID getUserId(
            Jwt jwt
    ) {

        try {
            return UUID.fromString(
                    jwt.getSubject()
            );
        } catch (Exception exception) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Token de autenticación inválido"
            );
        }
    }

    private static class AccountAccumulator {

        private final Account account;

        private BigDecimal totalDebit =
                BigDecimal.ZERO;

        private BigDecimal totalCredit =
                BigDecimal.ZERO;

        private AccountAccumulator(
                Account account
        ) {
            this.account = account;
        }

        private void add(
                JournalEntryLine line
        ) {

            this.totalDebit =
                    this.totalDebit.add(
                            line.getDebit()
                    );

            this.totalCredit =
                    this.totalCredit.add(
                            line.getCredit()
                    );
        }
    }
}