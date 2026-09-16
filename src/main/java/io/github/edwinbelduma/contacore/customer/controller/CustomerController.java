package io.github.edwinbelduma.contacore.customer.controller;

import io.github.edwinbelduma.contacore.customer.dto.CreateCustomerRequest;
import io.github.edwinbelduma.contacore.customer.dto.CustomerResponse;
import io.github.edwinbelduma.contacore.customer.dto.UpdateCustomerRequest;
import io.github.edwinbelduma.contacore.customer.service.CustomerService;
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
@RequestMapping(
        "/api/accounting-entities/{entityId}/customers"
)
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(
            CustomerService customerService
    ) {
        this.customerService = customerService;
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,
            @Valid
            @RequestBody CreateCustomerRequest request
    ) {

        CustomerResponse response =
                customerService.create(
                        jwt,
                        entityId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> findAll(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId
    ) {

        return ResponseEntity.ok(
                customerService.findAll(
                        jwt,
                        entityId
                )
        );
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> findById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,
            @PathVariable UUID customerId
    ) {

        return ResponseEntity.ok(
                customerService.findById(
                        jwt,
                        entityId,
                        customerId
                )
        );
    }

    @PutMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,
            @PathVariable UUID customerId,
            @Valid
            @RequestBody UpdateCustomerRequest request
    ) {

        return ResponseEntity.ok(
                customerService.update(
                        jwt,
                        entityId,
                        customerId,
                        request
                )
        );
    }

    @DeleteMapping("/{customerId}")
    public ResponseEntity<Void> deactivate(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,
            @PathVariable UUID customerId
    ) {

        customerService.deactivate(
                jwt,
                entityId,
                customerId
        );

        return ResponseEntity
                .noContent()
                .build();
    }
}