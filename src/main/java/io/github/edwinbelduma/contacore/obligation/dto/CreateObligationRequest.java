package io.github.edwinbelduma.contacore.obligation.dto;

import io.github.edwinbelduma.contacore.obligation.domain.ObligationType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateObligationRequest(

        @NotNull(message = "El tipo de obligación es obligatorio")
        ObligationType type,

        UUID customerId,

        UUID supplierId,

        @NotNull(message = "La fecha de emisión es obligatoria")
        LocalDate issueDate,

        @NotNull(message = "La fecha de vencimiento es obligatoria")
        LocalDate dueDate,

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

        @NotNull(message = "El valor total es obligatorio")
        @DecimalMin(
                value = "0.01",
                message = "El valor total debe ser mayor que cero"
        )
        BigDecimal totalAmount

) {
}