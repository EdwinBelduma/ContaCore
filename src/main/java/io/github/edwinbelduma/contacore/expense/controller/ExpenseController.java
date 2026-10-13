package io.github.edwinbelduma.contacore.expense.controller;

import io.github.edwinbelduma.contacore.auth.service.AuthService;
import io.github.edwinbelduma.contacore.expense.domain.ExpenseStatus;
import io.github.edwinbelduma.contacore.expense.dto.CreateExpenseRequest;
import io.github.edwinbelduma.contacore.expense.dto.ExpenseResponse;
import io.github.edwinbelduma.contacore.expense.dto.UpdateExpenseRequest;
import io.github.edwinbelduma.contacore.expense.service.ExpenseService;
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
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT',
                'ASSISTANT'
            )
            """)
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
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT',
                'ASSISTANT',
                'AUDITOR'
            )
            """)
    public List<ExpenseResponse> findAll(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) ExpenseStatus status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return expenseService.search(
                entityId,
                ownerId,
                status,
                from,
                to
        );
    }

    @GetMapping("/{expenseId}")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT',
                'ASSISTANT',
                'AUDITOR'
            )
            """)
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
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT',
                'ASSISTANT'
            )
            """)
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
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT'
            )
            """)
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

    @PostMapping("/{expenseId}/void")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT'
            )
            """)
    public ExpenseResponse voidExpense(
            @PathVariable UUID entityId,
            @PathVariable UUID expenseId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId = authService
                .getCurrentUser(jwt)
                .id();

        return expenseService.voidExpense(
                entityId,
                expenseId,
                ownerId
        );
    }
}