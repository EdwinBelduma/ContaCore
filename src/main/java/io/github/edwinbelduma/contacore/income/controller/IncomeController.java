package io.github.edwinbelduma.contacore.income.controller;

import io.github.edwinbelduma.contacore.auth.service.AuthService;
import io.github.edwinbelduma.contacore.income.dto.CreateIncomeRequest;
import io.github.edwinbelduma.contacore.income.dto.IncomeResponse;
import io.github.edwinbelduma.contacore.income.dto.UpdateIncomeRequest;
import io.github.edwinbelduma.contacore.income.service.IncomeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting-entities/{entityId}/incomes")
public class IncomeController {

    private final IncomeService incomeService;
    private final AuthService authService;

    public IncomeController(
            IncomeService incomeService,
            AuthService authService
    ) {
        this.incomeService = incomeService;
        this.authService = authService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncomeResponse create(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateIncomeRequest request
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return incomeService.create(
                entityId,
                ownerId,
                request
        );
    }

    @GetMapping
    public List<IncomeResponse> findAll(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return incomeService.findAll(
                entityId,
                ownerId
        );
    }

    @GetMapping("/{incomeId}")
    public IncomeResponse findById(
            @PathVariable UUID entityId,
            @PathVariable UUID incomeId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return incomeService.findById(
                entityId,
                incomeId,
                ownerId
        );
    }

    @PutMapping("/{incomeId}")
    public IncomeResponse update(
            @PathVariable UUID entityId,
            @PathVariable UUID incomeId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateIncomeRequest request
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return incomeService.update(
                entityId,
                incomeId,
                ownerId,
                request
        );
    }

    @PostMapping("/{incomeId}/post")
    public IncomeResponse post(
            @PathVariable UUID entityId,
            @PathVariable UUID incomeId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return incomeService.post(
                entityId,
                incomeId,
                ownerId
        );
    }

    @PostMapping("/{incomeId}/void")
    public IncomeResponse voidIncome(
            @PathVariable UUID entityId,
            @PathVariable UUID incomeId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return incomeService.voidIncome(
                entityId,
                incomeId,
                ownerId
        );
    }
}