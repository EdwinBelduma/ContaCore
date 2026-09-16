package io.github.edwinbelduma.contacore.accounting.report.dto;

import io.github.edwinbelduma.contacore.accounting.account.domain.AccountNature;
import io.github.edwinbelduma.contacore.accounting.account.domain.AccountType;

import java.math.BigDecimal;
import java.util.UUID;

public record TrialBalanceAccountResponse(

        UUID accountId,
        String accountCode,
        String accountName,
        AccountType type,
        AccountNature nature,

        BigDecimal totalDebit,
        BigDecimal totalCredit,

        BigDecimal debitBalance,
        BigDecimal creditBalance

) {
}