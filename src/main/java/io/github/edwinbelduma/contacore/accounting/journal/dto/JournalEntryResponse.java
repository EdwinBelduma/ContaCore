package io.github.edwinbelduma.contacore.accounting.journal.dto;

import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record JournalEntryResponse(

        UUID id,
        UUID accountingEntityId,
        LocalDate entryDate,
        String description,
        String reference,
        JournalEntryStatus status,
        BigDecimal totalDebit,
        BigDecimal totalCredit,
        List<JournalEntryLineResponse> lines

) {
}