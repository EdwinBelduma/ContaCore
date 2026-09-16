package io.github.edwinbelduma.contacore.accounting.report.dto;

import java.math.BigDecimal;

public record JournalReportLineResponse(

        int lineNumber,
        String accountCode,
        String accountName,
        String description,
        BigDecimal debit,
        BigDecimal credit

) {
}