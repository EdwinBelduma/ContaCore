package io.github.edwinbelduma.contacore.obligation.controller;

import io.github.edwinbelduma.contacore.auth.service.AuthService;
import io.github.edwinbelduma.contacore.obligation.dto.CreateObligationRequest;
import io.github.edwinbelduma.contacore.obligation.dto.ObligationResponse;
import io.github.edwinbelduma.contacore.obligation.dto.UpdateObligationRequest;
import io.github.edwinbelduma.contacore.obligation.service.ObligationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

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
    public List<ObligationResponse> findAll(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return obligationService.findAll(
                entityId,
                ownerId
        );
    }

    @GetMapping("/{obligationId}")
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