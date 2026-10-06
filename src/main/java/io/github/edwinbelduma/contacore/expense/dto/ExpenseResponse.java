package io.github.edwinbelduma.contacore.expense.dto;

import io.github.edwinbelduma.contacore.expense.domain.ExpenseStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ExpenseResponse(

        UUID id,

        UUID accountingEntityId,

        UUID supplierId,

        LocalDate expenseDate,

        String description,

        String reference,

        BigDecimal amount,

        UUID expenseAccountId,

        UUID paymentAccountId,

        ExpenseStatus status,

        UUID journalEntryId

) {
}