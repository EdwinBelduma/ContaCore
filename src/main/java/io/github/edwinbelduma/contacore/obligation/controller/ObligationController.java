package io.github.edwinbelduma.contacore.obligation.controller;

import io.github.edwinbelduma.contacore.auth.service.AuthService;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationStatus;
import io.github.edwinbelduma.contacore.obligation.domain.ObligationType;
import io.github.edwinbelduma.contacore.obligation.dto.CreateObligationRequest;
import io.github.edwinbelduma.contacore.obligation.dto.ObligationResponse;
import io.github.edwinbelduma.contacore.obligation.dto.UpdateObligationRequest;
import io.github.edwinbelduma.contacore.obligation.service.ObligationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting-entities/{entityId}/obligations")
public class ObligationController {

    private final ObligationService obligationService;
    private final AuthService authService;

    public ObligationController(
            ObligationService obligationService,
            AuthService authService
    ) {
        this.obligationService = obligationService;
        this.authService = authService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT',
                'ASSISTANT'
            )
            """)
    public ObligationResponse create(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateObligationRequest request
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return obligationService.create(
                entityId,
                ownerId,
                request
        );
    }

    @GetMapping
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT',
                'ASSISTANT',
                'AUDITOR'
            )
            """)
    public List<ObligationResponse> findAll(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) ObligationType type,
            @RequestParam(required = false) ObligationStatus status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dueFrom,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dueTo
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return obligationService.search(
                entityId,
                ownerId,
                type,
                status,
                dueFrom,
                dueTo
        );
    }

    @GetMapping("/{obligationId}")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT',
                'ASSISTANT',
                'AUDITOR'
            )
            """)
    public ObligationResponse findById(
            @PathVariable UUID entityId,
            @PathVariable UUID obligationId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return obligationService.findById(
                entityId,
                obligationId,
                ownerId
        );
    }

    @PutMapping("/{obligationId}")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT',
                'ASSISTANT'
            )
            """)
    public ObligationResponse update(
            @PathVariable UUID entityId,
            @PathVariable UUID obligationId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateObligationRequest request
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return obligationService.update(
                entityId,
                obligationId,
                ownerId,
                request
        );
    }

    @PostMapping("/{obligationId}/void")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT'
            )
            """)
    public ObligationResponse voidObligation(
            @PathVariable UUID entityId,
            @PathVariable UUID obligationId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return obligationService.voidObligation(
                entityId,
                obligationId,
                ownerId
        );
    }
}