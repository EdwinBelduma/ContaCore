package io.github.edwinbelduma.contacore.accounting.report.service;

import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntry;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryLine;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryStatus;
import io.github.edwinbelduma.contacore.accounting.journal.repository.JournalEntryRepository;
import io.github.edwinbelduma.contacore.accounting.report.dto.JournalReportEntryResponse;
import io.github.edwinbelduma.contacore.accounting.report.dto.JournalReportLineResponse;
import io.github.edwinbelduma.contacore.accounting.report.dto.JournalReportResponse;
import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.accountingentity.repository.AccountingEntityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class JournalReportService {

    private final JournalEntryRepository journalEntryRepository;
    private final AccountingEntityRepository accountingEntityRepository;

    public JournalReportService(
            JournalEntryRepository journalEntryRepository,
            AccountingEntityRepository accountingEntityRepository
    ) {
        this.journalEntryRepository = journalEntryRepository;
        this.accountingEntityRepository = accountingEntityRepository;
    }

    @Transactional(readOnly = true)
    public JournalReportResponse generate(
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

        List<JournalEntry> journalEntries =
                journalEntryRepository
                        .findByAccountingEntity_IdAndStatusAndEntryDateBetweenOrderByEntryDateAscCreatedAtAsc(
                                entityId,
                                JournalEntryStatus.POSTED,
                                from,
                                to
                        );

        List<JournalReportEntryResponse> entries =
                journalEntries
                        .stream()
                        .map(this::toEntryResponse)
                        .toList();

        BigDecimal totalDebit =
                entries.stream()
                        .map(JournalReportEntryResponse::totalDebit)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalCredit =
                entries.stream()
                        .map(JournalReportEntryResponse::totalCredit)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return new JournalReportResponse(
                accountingEntity.getId(),
                accountingEntity.getDisplayName(),
                from,
                to,
                totalDebit,
                totalCredit,
                entries
        );
    }

    private JournalReportEntryResponse toEntryResponse(
            JournalEntry entry
    ) {

        List<JournalReportLineResponse> lines =
                entry.getLines()
                        .stream()
                        .map(this::toLineResponse)
                        .toList();

        BigDecimal totalDebit =
                entry.getLines()
                        .stream()
                        .map(JournalEntryLine::getDebit)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalCredit =
                entry.getLines()
                        .stream()
                        .map(JournalEntryLine::getCredit)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return new JournalReportEntryResponse(
                entry.getId(),
                entry.getEntryDate(),
                entry.getDescription(),
                entry.getReference(),
                totalDebit,
                totalCredit,
                lines
        );
    }

    private JournalReportLineResponse toLineResponse(
            JournalEntryLine line
    ) {

        return new JournalReportLineResponse(
                line.getLineNumber(),
                line.getAccount().getCode(),
                line.getAccount().getName(),
                line.getDescription(),
                line.getDebit(),
                line.getCredit()
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