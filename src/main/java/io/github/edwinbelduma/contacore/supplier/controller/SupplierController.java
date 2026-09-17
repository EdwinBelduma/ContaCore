
package io.github.edwinbelduma.contacore.supplier.controller;

import io.github.edwinbelduma.contacore.auth.service.AuthService;
import io.github.edwinbelduma.contacore.supplier.dto.CreateSupplierRequest;
import io.github.edwinbelduma.contacore.supplier.dto.SupplierResponse;
import io.github.edwinbelduma.contacore.supplier.dto.UpdateSupplierRequest;
import io.github.edwinbelduma.contacore.supplier.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting-entities/{entityId}/suppliers")
public class SupplierController {

    private final SupplierService supplierService;
    private final AuthService authService;

    public SupplierController(
            SupplierService supplierService,
            AuthService authService
    ) {
        this.supplierService = supplierService;
        this.authService = authService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SupplierResponse create(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateSupplierRequest request
    ) {

        UUID ownerId =
                authService.getCurrentUser(jwt).id();

        return supplierService.create(
                entityId,
                ownerId,
                request
        );
    }

    @GetMapping
    public List<SupplierResponse> findAll(
            @PathVariable UUID entityId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId =
                authService.getCurrentUser(jwt).id();

        return supplierService.findAll(
                entityId,
                ownerId
        );
    }

    @GetMapping("/{supplierId}")
    public SupplierResponse findById(
            @PathVariable UUID entityId,
            @PathVariable UUID supplierId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId =
                authService.getCurrentUser(jwt).id();

        return supplierService.findById(
                entityId,
                supplierId,
                ownerId
        );
    }

    @PutMapping("/{supplierId}")
    public SupplierResponse update(
            @PathVariable UUID entityId,
            @PathVariable UUID supplierId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateSupplierRequest request
    ) {

        UUID ownerId =
                authService.getCurrentUser(jwt).id();

        return supplierService.update(
                entityId,
                supplierId,
                ownerId,
                request
        );
    }

    @DeleteMapping("/{supplierId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(
            @PathVariable UUID entityId,
            @PathVariable UUID supplierId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        UUID ownerId =
                authService.getCurrentUser(jwt).id();

        supplierService.deactivate(
                entityId,
                supplierId,
                ownerId
        );
    }
}