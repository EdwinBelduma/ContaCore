package io.github.edwinbelduma.contacore.accounting.account.controller;

import io.github.edwinbelduma.contacore.accounting.account.dto.AccountResponse;
import io.github.edwinbelduma.contacore.accounting.account.dto.CreateAccountRequest;
import io.github.edwinbelduma.contacore.accounting.account.dto.UpdateAccountRequest;
import io.github.edwinbelduma.contacore.accounting.account.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(
        "/api/accounting-entities/{entityId}/accounts"
)
public class AccountController {

    private final AccountService accountService;

    public AccountController(
            AccountService accountService
    ) {
        this.accountService = accountService;
    }

    @PostMapping
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT'
            )
            """)
    public ResponseEntity<AccountResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,
            @Valid
            @RequestBody CreateAccountRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        accountService.create(
                                jwt,
                                entityId,
                                request
                        )
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
    public ResponseEntity<List<AccountResponse>> findAll(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId
    ) {

        return ResponseEntity.ok(
                accountService.findAll(
                        jwt,
                        entityId
                )
        );
    }

    @GetMapping("/{accountId}")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT',
                'ASSISTANT',
                'AUDITOR'
            )
            """)
    public ResponseEntity<AccountResponse> findById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,
            @PathVariable UUID accountId
    ) {

        return ResponseEntity.ok(
                accountService.findById(
                        jwt,
                        entityId,
                        accountId
                )
        );
    }

    @PutMapping("/{accountId}")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'MANAGER',
                'ACCOUNTANT'
            )
            """)
    public ResponseEntity<AccountResponse> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,
            @PathVariable UUID accountId,
            @Valid
            @RequestBody UpdateAccountRequest request
    ) {

        return ResponseEntity.ok(
                accountService.update(
                        jwt,
                        entityId,
                        accountId,
                        request
                )
        );
    }

    @DeleteMapping("/{accountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,
            @PathVariable UUID accountId
    ) {

        accountService.deactivate(
                jwt,
                entityId,
                accountId
        );

        return ResponseEntity
                .noContent()
                .build();
    }
}