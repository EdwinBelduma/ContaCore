package io.github.edwinbelduma.contacore.accounting.report.dto;

import io.github.edwinbelduma.contacore.accounting.account.domain.AccountNature;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record LedgerReportResponse(

        UUID accountingEntityId,
        String accountingEntityName,

        UUID accountId,
        String accountCode,
        String accountName,
        AccountNature nature,

        LocalDate from,
        LocalDate to,

        BigDecimal openingBalance,
        BigDecimal totalDebit,
        BigDecimal totalCredit,
        BigDecimal closingBalance,

        List<LedgerLineResponse> movements

) {
}