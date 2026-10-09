package io.github.edwinbelduma.contacore.income.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateIncomeRequest(

        UUID customerId,

        @NotNull(message = "La fecha del ingreso es obligatoria")
        LocalDate incomeDate,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(
                max = 255,
                message = "La descripción no puede superar 255 caracteres"
        )
        String description,

        @Size(
                max = 100,
                message = "La referencia no puede superar 100 caracteres"
        )
        String reference,

        @NotNull(message = "El valor del ingreso es obligatorio")
        @DecimalMin(
                value = "0.01",
                message = "El valor del ingreso debe ser mayor que cero"
        )
        BigDecimal amount,

        @NotNull(message = "La cuenta de ingresos es obligatoria")
        UUID incomeAccountId,

        @NotNull(message = "La cuenta de recepción es obligatoria")
        UUID receiptAccountId

) {
}