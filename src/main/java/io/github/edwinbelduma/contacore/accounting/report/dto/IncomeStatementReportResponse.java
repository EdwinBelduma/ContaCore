package io.github.edwinbelduma.contacore.accounting.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record IncomeStatementReportResponse(

        UUID accountingEntityId,
        String accountingEntityName,

        LocalDate from,
        LocalDate to,

        List<IncomeStatementAccountResponse> incomeAccounts,
        List<IncomeStatementAccountResponse> expenseAccounts,

        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal netResult

) {
}