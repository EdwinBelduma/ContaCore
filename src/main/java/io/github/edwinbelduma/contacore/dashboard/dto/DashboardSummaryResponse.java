package io.github.edwinbelduma.contacore.dashboard.dto;

import java.math.BigDecimal;

public record DashboardSummaryResponse(

        BigDecimal totalIncome,

        BigDecimal totalExpenses,

        BigDecimal netResult,

        BigDecimal totalReceivable,

        BigDecimal totalPayable,

        long overdueObligations

) {
}