package io.github.edwinbelduma.contacore.accounting.report.dto;

import io.github.edwinbelduma.contacore.accounting.account.domain.AccountType;

import java.math.BigDecimal;
import java.util.UUID;

public record IncomeStatementAccountResponse(

        UUID accountId,
        String accountCode,
        String accountName,
        AccountType type,
        BigDecimal amount

) {
}