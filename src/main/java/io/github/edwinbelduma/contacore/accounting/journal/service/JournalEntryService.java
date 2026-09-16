package io.github.edwinbelduma.contacore.accounting.journal.service;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.account.repository.AccountRepository;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntry;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryLine;
import io.github.edwinbelduma.contacore.accounting.journal.dto.CreateJournalEntryLineRequest;
import io.github.edwinbelduma.contacore.accounting.journal.dto.CreateJournalEntryRequest;
import io.github.edwinbelduma.contacore.accounting.journal.dto.JournalEntryLineResponse;
import io.github.edwinbelduma.contacore.accounting.journal.dto.JournalEntryResponse;
import io.github.edwinbelduma.contacore.accounting.journal.repository.JournalEntryRepository;
import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.accountingentity.repository.AccountingEntityRepository;
import io.github.edwinbelduma.contacore.user.domain.User;
import io.github.edwinbelduma.contacore.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class JournalEntryService {

    private final JournalEntryRepository journalEntryRepository;
    private final AccountRepository accountRepository;
    private final AccountingEntityRepository accountingEntityRepository;
    private final UserRepository userRepository;

    public JournalEntryService(
            JournalEntryRepository journalEntryRepository,
            AccountRepository accountRepository,
            AccountingEntityRepository accountingEntityRepository,
            UserRepository userRepository
    ) {
        this.journalEntryRepository = journalEntryRepository;
        this.accountRepository = accountRepository;
        this.accountingEntityRepository = accountingEntityRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public JournalEntryResponse create(
            Jwt jwt,
            UUID entityId,
            CreateJournalEntryRequest request
    ) {

        UUID userId = getUserId(jwt);

        AccountingEntity accountingEntity =
                getAccountingEntity(
                        entityId,
                        userId
                );

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Usuario autenticado no encontrado"
                        )
                );

        if (request.lines().size() < 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Un asiento debe contener al menos dos movimientos"
            );
        }

        validateBalance(request.lines());

        JournalEntry entry =
                new JournalEntry(
                        accountingEntity,
                        request.entryDate(),
                        request.description().trim(),
                        normalize(request.reference()),
                        user
                );

        int lineNumber = 1;

        for (
                CreateJournalEntryLineRequest lineRequest
                : request.lines()
        ) {

            Account account = accountRepository
                    .findByIdAndAccountingEntity_IdAndActiveTrue(
                            lineRequest.accountId(),
                            entityId
                    )
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "La cuenta contable no existe o está inactiva"
                            )
                    );

            if (!account.isAllowsEntries()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La cuenta "
                                + account.getCode()
                                + " - "
                                + account.getName()
                                + " no permite movimientos"
                );
            }

            validateLine(lineRequest);

            JournalEntryLine line =
                    new JournalEntryLine(
                            entry,
                            account,
                            lineNumber++,
                            normalize(
                                    lineRequest.description()
                            ),
                            lineRequest.debit(),
                            lineRequest.credit()
                    );

            entry.addLine(line);
        }

        entry.post();

        JournalEntry saved =
                journalEntryRepository.save(entry);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<JournalEntryResponse> findAll(
            Jwt jwt,
            UUID entityId
    ) {

        UUID userId = getUserId(jwt);

        getAccountingEntity(
                entityId,
                userId
        );

        return journalEntryRepository
                .findByAccountingEntity_IdOrderByEntryDateDescCreatedAtDesc(
                        entityId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public JournalEntryResponse findById(
            Jwt jwt,
            UUID entityId,
            UUID entryId
    ) {

        UUID userId = getUserId(jwt);

        getAccountingEntity(
                entityId,
                userId
        );

        JournalEntry entry =
                journalEntryRepository
                        .findByIdAndAccountingEntity_Id(
                                entryId,
                                entityId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Asiento contable no encontrado"
                                )
                        );

        return toResponse(entry);
    }

    private void validateBalance(
            List<CreateJournalEntryLineRequest> lines
    ) {

        BigDecimal totalDebit =
                lines.stream()
                        .map(
                                CreateJournalEntryLineRequest::debit
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalCredit =
                lines.stream()
                        .map(
                                CreateJournalEntryLineRequest::credit
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        if (totalDebit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El asiento debe tener valores mayores a cero"
            );
        }

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El asiento está descuadrado. "
                            + "Debe: "
                            + totalDebit
                            + " - Haber: "
                            + totalCredit
            );
        }
    }

    private void validateLine(
            CreateJournalEntryLineRequest line
    ) {

        boolean hasDebit =
                line.debit().compareTo(
                        BigDecimal.ZERO
                ) > 0;

        boolean hasCredit =
                line.credit().compareTo(
                        BigDecimal.ZERO
                ) > 0;

        if (hasDebit == hasCredit) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cada movimiento debe tener valor "
                            + "únicamente en Debe o en Haber"
            );
        }
    }

    private AccountingEntity getAccountingEntity(
            UUID entityId,
            UUID userId
    ) {

        return accountingEntityRepository
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

    private JournalEntryResponse toResponse(
            JournalEntry entry
    ) {

        List<JournalEntryLineResponse> lines =
                entry.getLines()
                        .stream()
                        .map(line ->
                                new JournalEntryLineResponse(
                                        line.getId(),
                                        line.getLineNumber(),
                                        line.getAccount().getId(),
                                        line.getAccount().getCode(),
                                        line.getAccount().getName(),
                                        line.getDescription(),
                                        line.getDebit(),
                                        line.getCredit()
                                )
                        )
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

        return new JournalEntryResponse(
                entry.getId(),
                entry.getAccountingEntity().getId(),
                entry.getEntryDate(),
                entry.getDescription(),
                entry.getReference(),
                entry.getStatus(),
                totalDebit,
                totalCredit,
                lines
        );
    }

    private String normalize(
            String value
    ) {

        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}