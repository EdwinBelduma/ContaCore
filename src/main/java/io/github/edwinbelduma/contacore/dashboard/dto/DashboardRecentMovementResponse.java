package io.github.edwinbelduma.contacore.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DashboardRecentMovementResponse(

        UUID id,

        String type,

        LocalDate date,

        String description,

        String reference,

        BigDecimal amount

) {
}