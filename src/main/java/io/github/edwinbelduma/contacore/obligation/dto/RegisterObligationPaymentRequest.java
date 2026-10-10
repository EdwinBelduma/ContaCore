package io.github.edwinbelduma.contacore.obligation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RegisterObligationPaymentRequest(

        @NotNull(message = "La fecha del pago o cobro es obligatoria")
        LocalDate paymentDate,

        @NotNull(message = "El valor es obligatorio")
        @DecimalMin(
                value = "0.01",
                message = "El valor debe ser mayor que cero"
        )
        BigDecimal amount,

        @NotNull(message = "La cuenta de efectivo o banco es obligatoria")
        UUID cashAccountId,

        @NotNull(message = "La cuenta de la obligación es obligatoria")
        UUID obligationAccountId

) {
}