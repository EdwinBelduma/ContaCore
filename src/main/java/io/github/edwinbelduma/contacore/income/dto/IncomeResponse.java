package io.github.edwinbelduma.contacore.income.dto;

import io.github.edwinbelduma.contacore.income.domain.IncomeStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record IncomeResponse(

        UUID id,

        UUID accountingEntityId,

        UUID customerId,

        LocalDate incomeDate,

        String description,

        String reference,

        BigDecimal amount,

        UUID incomeAccountId,

        UUID receiptAccountId,

        IncomeStatus status,

        UUID journalEntryId

) {
}