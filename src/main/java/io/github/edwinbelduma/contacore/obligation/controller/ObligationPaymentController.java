package io.github.edwinbelduma.contacore.obligation.controller;

import io.github.edwinbelduma.contacore.auth.service.AuthService;
import io.github.edwinbelduma.contacore.obligation.dto.ObligationPaymentResponse;
import io.github.edwinbelduma.contacore.obligation.dto.RegisterObligationPaymentRequest;
import io.github.edwinbelduma.contacore.obligation.service.ObligationPaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(
        "/api/accounting-entities/{entityId}/obligations/{obligationId}/payments"
)
public class ObligationPaymentController {

    private final ObligationPaymentService obligationPaymentService;
    private final AuthService authService;

    public ObligationPaymentController(
            ObligationPaymentService obligationPaymentService,
            AuthService authService
    ) {
        this.obligationPaymentService = obligationPaymentService;
        this.authService = authService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT'
            )
            """)
    public ObligationPaymentResponse registerPayment(
            @PathVariable UUID entityId,
            @PathVariable UUID obligationId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody RegisterObligationPaymentRequest request
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return obligationPaymentService.registerPayment(
                entityId,
                obligationId,
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
    public List<ObligationPaymentResponse> findAll(
            @PathVariable UUID entityId,
            @PathVariable UUID obligationId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return obligationPaymentService.findAll(
                entityId,
                obligationId,
                ownerId
        );
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT',
                'ASSISTANT',
                'AUDITOR'
            )
            """)
    public ObligationPaymentResponse findById(
            @PathVariable UUID entityId,
            @PathVariable UUID obligationId,
            @PathVariable UUID paymentId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return obligationPaymentService.findById(
                entityId,
                obligationId,
                paymentId,
                ownerId
        );
    }

    @PostMapping("/{paymentId}/void")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT'
            )
            """)
    public ObligationPaymentResponse voidPayment(
            @PathVariable UUID entityId,
            @PathVariable UUID obligationId,
            @PathVariable UUID paymentId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return obligationPaymentService.voidPayment(
                entityId,
                obligationId,
                paymentId,
                ownerId
        );
    }
}