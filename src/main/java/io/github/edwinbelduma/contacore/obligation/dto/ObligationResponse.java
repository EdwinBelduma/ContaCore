package io.github.edwinbelduma.contacore.obligation.dto;

import io.github.edwinbelduma.contacore.obligation.domain.ObligationStatus;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ObligationResponse(

        UUID id,

        UUID accountingEntityId,

        ObligationType type,

        UUID customerId,

        UUID supplierId,

        LocalDate issueDate,

        LocalDate dueDate,

        String description,

        String reference,

        BigDecimal totalAmount,

        BigDecimal paidAmount,

        BigDecimal outstandingAmount,

        ObligationStatus status

) {
}