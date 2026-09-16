package io.github.edwinbelduma.contacore.accounting.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LedgerLineResponse(

        LocalDate entryDate,
        UUID journalEntryId,
        String reference,
        String description,
        BigDecimal debit,
        BigDecimal credit,
        BigDecimal balance

) {
}