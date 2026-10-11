package io.github.edwinbelduma.contacore.dashboard.controller;

import io.github.edwinbelduma.contacore.auth.service.AuthService;
import io.github.edwinbelduma.contacore.dashboard.dto.DashboardRecentMovementResponse;
import io.github.edwinbelduma.contacore.dashboard.dto.DashboardSummaryResponse;
import io.github.edwinbelduma.contacore.dashboard.service.DashboardService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting-entities/{entityId}/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuthService authService;

    public DashboardController(
            DashboardService dashboardService,
            AuthService authService
    ) {
        this.dashboardService = dashboardService;
        this.authService = authService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return dashboardService.getSummary(
                entityId,
                ownerId
        );
    }

    @GetMapping("/recent-movements")
    public List<DashboardRecentMovementResponse> getRecentMovements(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return dashboardService.getRecentMovements(
                entityId,
                ownerId
        );
    }
}