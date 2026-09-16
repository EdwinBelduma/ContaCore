package io.github.edwinbelduma.contacore.accounting.journal.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record JournalEntryLineResponse(

        UUID id,
        int lineNumber,
        UUID accountId,
        String accountCode,
        String accountName,
        String description,
        BigDecimal debit,
        BigDecimal credit

) {
}