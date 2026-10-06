package io.github.edwinbelduma.contacore.expense.controller;

import io.github.edwinbelduma.contacore.auth.service.AuthService;
import io.github.edwinbelduma.contacore.expense.dto.CreateExpenseRequest;
import io.github.edwinbelduma.contacore.expense.dto.ExpenseResponse;
import io.github.edwinbelduma.contacore.expense.dto.UpdateExpenseRequest;
import io.github.edwinbelduma.contacore.expense.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting-entities/{entityId}/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final AuthService authService;

    public ExpenseController(
            ExpenseService expenseService,
            AuthService authService
    ) {
        this.expenseService = expenseService;
        this.authService = authService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateExpenseRequest request
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return expenseService.create(
                entityId,
                ownerId,
                request
        );
    }

    @GetMapping
    public List<ExpenseResponse> findAll(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return expenseService.findAll(
                entityId,
                ownerId
        );
    }

    @GetMapping("/{expenseId}")
    public ExpenseResponse findById(
            @PathVariable UUID entityId,
            @PathVariable UUID expenseId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return expenseService.findById(
                entityId,
                expenseId,
                ownerId
        );
    }

    @PutMapping("/{expenseId}")
    public ExpenseResponse update(
            @PathVariable UUID entityId,
            @PathVariable UUID expenseId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateExpenseRequest request
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return expenseService.update(
                entityId,
                expenseId,
                ownerId,
                request
        );
    }
    @PostMapping("/{expenseId}/post")
    public ExpenseResponse post(
            @PathVariable UUID entityId,
            @PathVariable UUID expenseId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return expenseService.post(
                entityId,
                expenseId,
                ownerId
        );
    }
}