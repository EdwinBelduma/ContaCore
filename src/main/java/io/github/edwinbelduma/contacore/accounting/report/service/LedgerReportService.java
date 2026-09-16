package io.github.edwinbelduma.contacore.accounting.report.service;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.account.domain.AccountNature;
import io.github.edwinbelduma.contacore.accounting.account.repository.AccountRepository;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryLine;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryStatus;
import io.github.edwinbelduma.contacore.accounting.journal.repository.JournalEntryLineRepository;
import io.github.edwinbelduma.contacore.accounting.report.dto.LedgerLineResponse;
import io.github.edwinbelduma.contacore.accounting.report.dto.LedgerReportResponse;
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
import java.util.List;
import java.util.UUID;

@Service
public class LedgerReportService {

    private final JournalEntryLineRepository journalEntryLineRepository;
    private final AccountRepository accountRepository;
    private final AccountingEntityRepository accountingEntityRepository;

    public LedgerReportService(
            JournalEntryLineRepository journalEntryLineRepository,
            AccountRepository accountRepository,
            AccountingEntityRepository accountingEntityRepository
    ) {
        this.journalEntryLineRepository =
                journalEntryLineRepository;

        this.accountRepository =
                accountRepository;

        this.accountingEntityRepository =
                accountingEntityRepository;
    }

    @Transactional(readOnly = true)
    public LedgerReportResponse generate(
            Jwt jwt,
            UUID entityId,
            UUID accountId,
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

        Account account =
                accountRepository
                        .findByIdAndAccountingEntity_Id(
                                accountId,
                                entityId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Cuenta contable no encontrada"
                                )
                        );

        List<JournalEntryLine> previousLines =
                journalEntryLineRepository
                        .findBeforeDate(
                                entityId,
                                accountId,
                                JournalEntryStatus.POSTED,
                                from
                        );

        BigDecimal openingBalance =
                calculateBalance(
                        account,
                        previousLines
                );

        List<JournalEntryLine> periodLines =
                journalEntryLineRepository
                        .findBetweenDates(
                                entityId,
                                accountId,
                                JournalEntryStatus.POSTED,
                                from,
                                to
                        );

        BigDecimal totalDebit =
                periodLines.stream()
                        .map(JournalEntryLine::getDebit)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalCredit =
                periodLines.stream()
                        .map(JournalEntryLine::getCredit)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal runningBalance =
                openingBalance;

        List<LedgerLineResponse> movements =
                new ArrayList<>();

        for (JournalEntryLine line : periodLines) {

            BigDecimal movement =
                    calculateMovement(
                            account,
                            line
                    );

            runningBalance =
                    runningBalance.add(movement);

            movements.add(
                    new LedgerLineResponse(
                            line.getJournalEntry()
                                    .getEntryDate(),

                            line.getJournalEntry()
                                    .getId(),

                            line.getJournalEntry()
                                    .getReference(),

                            line.getDescription(),

                            line.getDebit(),

                            line.getCredit(),

                            runningBalance
                    )
            );
        }

        return new LedgerReportResponse(
                accountingEntity.getId(),
                accountingEntity.getDisplayName(),

                account.getId(),
                account.getCode(),
                account.getName(),
                account.getNature(),

                from,
                to,

                openingBalance,
                totalDebit,
                totalCredit,
                runningBalance,

                movements
        );
    }

    private BigDecimal calculateBalance(
            Account account,
            List<JournalEntryLine> lines
    ) {

        return lines.stream()
                .map(line ->
                        calculateMovement(
                                account,
                                line
                        )
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    private BigDecimal calculateMovement(
            Account account,
            JournalEntryLine line
    ) {

        if (account.getNature()
                == AccountNature.DEBIT) {

            return line.getDebit()
                    .subtract(
                            line.getCredit()
                    );
        }

        return line.getCredit()
                .subtract(
                        line.getDebit()
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
}