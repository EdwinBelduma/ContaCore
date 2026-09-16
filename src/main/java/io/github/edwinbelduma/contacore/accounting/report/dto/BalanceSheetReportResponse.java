package io.github.edwinbelduma.contacore.accounting.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record BalanceSheetReportResponse(

        UUID accountingEntityId,
        String accountingEntityName,

        LocalDate asOf,

        List<BalanceSheetAccountResponse> assetAccounts,
        List<BalanceSheetAccountResponse> liabilityAccounts,
        List<BalanceSheetAccountResponse> equityAccounts,

        BigDecimal totalAssets,
        BigDecimal totalLiabilities,
        BigDecimal totalEquity,

        BigDecimal periodResult,

        BigDecimal totalLiabilitiesAndEquity,

        boolean balanced

) {
}