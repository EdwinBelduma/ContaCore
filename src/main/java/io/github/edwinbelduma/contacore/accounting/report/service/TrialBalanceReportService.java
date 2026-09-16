package io.github.edwinbelduma.contacore.accounting.report.service;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryLine;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryStatus;
import io.github.edwinbelduma.contacore.accounting.journal.repository.JournalEntryLineRepository;
import io.github.edwinbelduma.contacore.accounting.report.dto.TrialBalanceAccountResponse;
import io.github.edwinbelduma.contacore.accounting.report.dto.TrialBalanceReportResponse;
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
public class TrialBalanceReportService {

    private final JournalEntryLineRepository journalEntryLineRepository;
    private final AccountingEntityRepository accountingEntityRepository;

    public TrialBalanceReportService(
            JournalEntryLineRepository journalEntryLineRepository,
            AccountingEntityRepository accountingEntityRepository
    ) {
        this.journalEntryLineRepository =
                journalEntryLineRepository;

        this.accountingEntityRepository =
                accountingEntityRepository;
    }

    @Transactional(readOnly = true)
    public TrialBalanceReportResponse generate(
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

        List<TrialBalanceAccountResponse> accounts =
                new ArrayList<>();

        BigDecimal totalDebit =
                BigDecimal.ZERO;

        BigDecimal totalCredit =
                BigDecimal.ZERO;

        BigDecimal totalDebitBalance =
                BigDecimal.ZERO;

        BigDecimal totalCreditBalance =
                BigDecimal.ZERO;

        for (AccountAccumulator accumulator
                : accumulators.values()) {

            BigDecimal netBalance =
                    accumulator.totalDebit
                            .subtract(
                                    accumulator.totalCredit
                            );

            BigDecimal debitBalance;
            BigDecimal creditBalance;

            if (netBalance.compareTo(BigDecimal.ZERO) >= 0) {

                debitBalance = netBalance;
                creditBalance = BigDecimal.ZERO;

            } else {

                debitBalance = BigDecimal.ZERO;
                creditBalance = netBalance.abs();
            }

            accounts.add(
                    new TrialBalanceAccountResponse(
                            accumulator.account.getId(),
                            accumulator.account.getCode(),
                            accumulator.account.getName(),
                            accumulator.account.getType(),
                            accumulator.account.getNature(),
                            accumulator.totalDebit,
                            accumulator.totalCredit,
                            debitBalance,
                            creditBalance
                    )
            );

            totalDebit =
                    totalDebit.add(
                            accumulator.totalDebit
                    );

            totalCredit =
                    totalCredit.add(
                            accumulator.totalCredit
                    );

            totalDebitBalance =
                    totalDebitBalance.add(
                            debitBalance
                    );

            totalCreditBalance =
                    totalCreditBalance.add(
                            creditBalance
                    );
        }

        boolean balanced =
                totalDebit.compareTo(totalCredit) == 0
                        && totalDebitBalance.compareTo(
                        totalCreditBalance
                ) == 0;

        return new TrialBalanceReportResponse(
                accountingEntity.getId(),
                accountingEntity.getDisplayName(),

                from,
                to,

                totalDebit,
                totalCredit,

                totalDebitBalance,
                totalCreditBalance,

                balanced,

                accounts
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