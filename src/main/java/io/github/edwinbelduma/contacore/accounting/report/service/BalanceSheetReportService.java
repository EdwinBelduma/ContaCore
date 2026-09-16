package io.github.edwinbelduma.contacore.accounting.report.service;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.account.domain.AccountType;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryLine;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryStatus;
import io.github.edwinbelduma.contacore.accounting.journal.repository.JournalEntryLineRepository;
import io.github.edwinbelduma.contacore.accounting.report.dto.BalanceSheetAccountResponse;
import io.github.edwinbelduma.contacore.accounting.report.dto.BalanceSheetReportResponse;
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
public class BalanceSheetReportService {

    private final JournalEntryLineRepository journalEntryLineRepository;
    private final AccountingEntityRepository accountingEntityRepository;

    public BalanceSheetReportService(
            JournalEntryLineRepository journalEntryLineRepository,
            AccountingEntityRepository accountingEntityRepository
    ) {
        this.journalEntryLineRepository =
                journalEntryLineRepository;

        this.accountingEntityRepository =
                accountingEntityRepository;
    }

    @Transactional(readOnly = true)
    public BalanceSheetReportResponse generate(
            Jwt jwt,
            UUID entityId,
            LocalDate asOf
    ) {

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
                        .findAllUpToDate(
                                entityId,
                                JournalEntryStatus.POSTED,
                                asOf
                        );

        Map<UUID, AccountAccumulator> accumulators =
                new LinkedHashMap<>();

        for (JournalEntryLine line : lines) {

            Account account = line.getAccount();

            AccountAccumulator accumulator =
                    accumulators.computeIfAbsent(
                            account.getId(),
                            id -> new AccountAccumulator(account)
                    );

            accumulator.add(
                    line.getDebit(),
                    line.getCredit()
            );
        }

        List<BalanceSheetAccountResponse> assetAccounts =
                new ArrayList<>();

        List<BalanceSheetAccountResponse> liabilityAccounts =
                new ArrayList<>();

        List<BalanceSheetAccountResponse> equityAccounts =
                new ArrayList<>();

        BigDecimal totalAssets =
                BigDecimal.ZERO;

        BigDecimal totalLiabilities =
                BigDecimal.ZERO;

        BigDecimal totalEquity =
                BigDecimal.ZERO;

        BigDecimal totalIncome =
                BigDecimal.ZERO;

        BigDecimal totalExpenses =
                BigDecimal.ZERO;

        for (AccountAccumulator accumulator
                : accumulators.values()) {

            Account account =
                    accumulator.account;

            if (account.getType() == AccountType.ASSET) {

                BigDecimal balance =
                        accumulator.totalDebit.subtract(
                                accumulator.totalCredit
                        );

                assetAccounts.add(
                        new BalanceSheetAccountResponse(
                                account.getId(),
                                account.getCode(),
                                account.getName(),
                                account.getType(),
                                balance
                        )
                );

                totalAssets =
                        totalAssets.add(balance);
            }

            if (account.getType() == AccountType.LIABILITY) {

                BigDecimal balance =
                        accumulator.totalCredit.subtract(
                                accumulator.totalDebit
                        );

                liabilityAccounts.add(
                        new BalanceSheetAccountResponse(
                                account.getId(),
                                account.getCode(),
                                account.getName(),
                                account.getType(),
                                balance
                        )
                );

                totalLiabilities =
                        totalLiabilities.add(balance);
            }

            if (account.getType() == AccountType.EQUITY) {

                BigDecimal balance =
                        accumulator.totalCredit.subtract(
                                accumulator.totalDebit
                        );

                equityAccounts.add(
                        new BalanceSheetAccountResponse(
                                account.getId(),
                                account.getCode(),
                                account.getName(),
                                account.getType(),
                                balance
                        )
                );

                totalEquity =
                        totalEquity.add(balance);
            }

            if (account.getType() == AccountType.INCOME) {

                BigDecimal income =
                        accumulator.totalCredit.subtract(
                                accumulator.totalDebit
                        );

                totalIncome =
                        totalIncome.add(income);
            }

            if (account.getType() == AccountType.EXPENSE) {

                BigDecimal expense =
                        accumulator.totalDebit.subtract(
                                accumulator.totalCredit
                        );

                totalExpenses =
                        totalExpenses.add(expense);
            }
        }

        BigDecimal periodResult =
                totalIncome.subtract(
                        totalExpenses
                );

        BigDecimal totalLiabilitiesAndEquity =
                totalLiabilities
                        .add(totalEquity)
                        .add(periodResult);

        boolean balanced =
                totalAssets.compareTo(
                        totalLiabilitiesAndEquity
                ) == 0;

        return new BalanceSheetReportResponse(
                accountingEntity.getId(),
                accountingEntity.getDisplayName(),

                asOf,

                assetAccounts,
                liabilityAccounts,
                equityAccounts,

                totalAssets,
                totalLiabilities,
                totalEquity,

                periodResult,

                totalLiabilitiesAndEquity,

                balanced
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
                BigDecimal debit,
                BigDecimal credit
        ) {

            this.totalDebit =
                    this.totalDebit.add(debit);

            this.totalCredit =
                    this.totalCredit.add(credit);
        }
    }
}