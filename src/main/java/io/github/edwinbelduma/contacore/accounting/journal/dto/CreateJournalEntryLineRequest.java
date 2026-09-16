package io.github.edwinbelduma.contacore.accounting.journal.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateJournalEntryLineRequest(

        @NotNull(message = "La cuenta contable es obligatoria")
        UUID accountId,

        @Size(max = 255)
        String description,

        @NotNull(message = "El valor del debe es obligatorio")
        @DecimalMin(value = "0.00")
        BigDecimal debit,

        @NotNull(message = "El valor del haber es obligatorio")
        @DecimalMin(value = "0.00")
        BigDecimal credit

) {
}