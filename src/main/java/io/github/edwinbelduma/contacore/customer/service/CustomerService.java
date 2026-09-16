package io.github.edwinbelduma.contacore.customer.service;

import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.accountingentity.repository.AccountingEntityRepository;
import io.github.edwinbelduma.contacore.customer.domain.Customer;
import io.github.edwinbelduma.contacore.customer.dto.CreateCustomerRequest;
import io.github.edwinbelduma.contacore.customer.dto.CustomerResponse;
import io.github.edwinbelduma.contacore.customer.dto.UpdateCustomerRequest;
import io.github.edwinbelduma.contacore.customer.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AccountingEntityRepository accountingEntityRepository;

    public CustomerService(
            CustomerRepository customerRepository,
            AccountingEntityRepository accountingEntityRepository
    ) {
        this.customerRepository = customerRepository;
        this.accountingEntityRepository = accountingEntityRepository;
    }

    @Transactional
    public CustomerResponse create(
            Jwt jwt,
            UUID entityId,
            CreateCustomerRequest request
    ) {

        AccountingEntity accountingEntity =
                getAccountingEntity(jwt, entityId);

        String taxIdentifier =
                normalize(request.taxIdentifier());

        if (
                taxIdentifier != null
                        && customerRepository
                        .existsByAccountingEntity_IdAndTaxIdentifier(
                                entityId,
                                taxIdentifier
                        )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe un cliente con esa identificación"
            );
        }

        Customer customer = new Customer(
                accountingEntity,
                request.type(),
                request.displayName().trim(),
                taxIdentifier,
                normalize(request.email()),
                normalize(request.phone()),
                normalize(request.address())
        );

        Customer saved =
                customerRepository.save(customer);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> findAll(
            Jwt jwt,
            UUID entityId
    ) {

        getAccountingEntity(jwt, entityId);

        return customerRepository
                .findByAccountingEntity_IdAndActiveTrueOrderByDisplayNameAsc(
                        entityId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(
            Jwt jwt,
            UUID entityId,
            UUID customerId
    ) {

        getAccountingEntity(jwt, entityId);

        Customer customer =
                getCustomer(
                        entityId,
                        customerId
                );

        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse update(
            Jwt jwt,
            UUID entityId,
            UUID customerId,
            UpdateCustomerRequest request
    ) {

        getAccountingEntity(jwt, entityId);

        Customer customer =
                getCustomer(
                        entityId,
                        customerId
                );

        String taxIdentifier =
                normalize(request.taxIdentifier());

        if (
                taxIdentifier != null
                        && customerRepository
                        .existsByAccountingEntity_IdAndTaxIdentifierAndIdNot(
                                entityId,
                                taxIdentifier,
                                customerId
                        )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe otro cliente con esa identificación"
            );
        }

        customer.update(
                request.type(),
                request.displayName().trim(),
                taxIdentifier,
                normalize(request.email()),
                normalize(request.phone()),
                normalize(request.address())
        );

        return toResponse(customer);
    }

    @Transactional
    public void deactivate(
            Jwt jwt,
            UUID entityId,
            UUID customerId
    ) {

        getAccountingEntity(jwt, entityId);

        Customer customer =
                getCustomer(
                        entityId,
                        customerId
                );

        customer.deactivate();
    }

    private AccountingEntity getAccountingEntity(
            Jwt jwt,
            UUID entityId
    ) {

        UUID userId = getUserId(jwt);

        return accountingEntityRepository
                .findByIdAndOwner_IdAndActiveTrue(
                        entityId,
                        userId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Entidad contable no encontrada"
                        )
                );
    }

    private Customer getCustomer(
            UUID entityId,
            UUID customerId
    ) {

        return customerRepository
                .findByIdAndAccountingEntity_IdAndActiveTrue(
                        customerId,
                        entityId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cliente no encontrado"
                        )
                );
    }

    private UUID getUserId(
            Jwt jwt
    ) {

        try {
            return UUID.fromString(
                    jwt.getSubject()
            );
        } catch (Exception exception) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Token de autenticación inválido"
            );
        }
    }

    private CustomerResponse toResponse(
            Customer customer
    ) {

        return new CustomerResponse(
                customer.getId(),
                customer.getAccountingEntity().getId(),
                customer.getType(),
                customer.getDisplayName(),
                customer.getTaxIdentifier(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress(),
                customer.isActive()
        );
    }

    private String normalize(
            String value
    ) {

        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}