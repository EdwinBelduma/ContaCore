package io.github.edwinbelduma.contacore.obligation.dto;

import io.github.edwinbelduma.contacore.obligation.domain.ObligationPaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ObligationPaymentResponse(

        UUID id,

        UUID obligationId,

        LocalDate paymentDate,

        BigDecimal amount,

        UUID cashAccountId,

        ObligationPaymentStatus status,

        UUID journalEntryId

) {
}