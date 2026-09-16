package io.github.edwinbelduma.contacore.accounting.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record JournalReportEntryResponse(

        UUID id,
        LocalDate entryDate,
        String description,
        String reference,
        BigDecimal totalDebit,
        BigDecimal totalCredit,
        List<JournalReportLineResponse> lines

) {
}