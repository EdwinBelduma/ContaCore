package io.github.edwinbelduma.contacore.expense.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateExpenseRequest(

        UUID supplierId,

        @NotNull(message = "La fecha del gasto es obligatoria")
        LocalDate expenseDate,

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

        @NotNull(message = "El valor del gasto es obligatorio")
        @DecimalMin(
                value = "0.01",
                message = "El valor del gasto debe ser mayor que cero"
        )
        BigDecimal amount,

        @NotNull(message = "La cuenta de gasto es obligatoria")
        UUID expenseAccountId,

        @NotNull(message = "La cuenta de pago es obligatoria")
        UUID paymentAccountId

) {
}