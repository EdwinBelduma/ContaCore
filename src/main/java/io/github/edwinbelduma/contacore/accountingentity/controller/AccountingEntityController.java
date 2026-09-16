package io.github.edwinbelduma.contacore.accountingentity.controller;

import io.github.edwinbelduma.contacore.accountingentity.dto.AccountingEntityResponse;
import io.github.edwinbelduma.contacore.accountingentity.dto.CreateAccountingEntityRequest;
import io.github.edwinbelduma.contacore.accountingentity.dto.UpdateAccountingEntityRequest;
import io.github.edwinbelduma.contacore.accountingentity.service.AccountingEntityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting-entities")
public class AccountingEntityController {

    private final AccountingEntityService accountingEntityService;

    public AccountingEntityController(
            AccountingEntityService accountingEntityService
    ) {
        this.accountingEntityService =
                accountingEntityService;
    }

    @PostMapping
    public ResponseEntity<AccountingEntityResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid
            @RequestBody
            CreateAccountingEntityRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        accountingEntityService.create(
                                jwt,
                                request
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<AccountingEntityResponse>> findAll(
            @AuthenticationPrincipal Jwt jwt
    ) {

        return ResponseEntity.ok(
                accountingEntityService
                        .findAllByCurrentUser(jwt)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountingEntityResponse> findById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                accountingEntityService.findById(
                        jwt,
                        id
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountingEntityResponse> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid
            @RequestBody
            UpdateAccountingEntityRequest request
    ) {

        return ResponseEntity.ok(
                accountingEntityService.update(
                        jwt,
                        id,
                        request
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id
    ) {

        accountingEntityService.deactivate(
                jwt,
                id
        );

        return ResponseEntity.noContent().build();
    }
}