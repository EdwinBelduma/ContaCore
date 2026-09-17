package io.github.edwinbelduma.contacore.supplier.service;

import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.accountingentity.repository.AccountingEntityRepository;
import io.github.edwinbelduma.contacore.supplier.domain.Supplier;
import io.github.edwinbelduma.contacore.supplier.dto.CreateSupplierRequest;
import io.github.edwinbelduma.contacore.supplier.dto.SupplierResponse;
import io.github.edwinbelduma.contacore.supplier.dto.UpdateSupplierRequest;
import io.github.edwinbelduma.contacore.supplier.repository.SupplierRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final AccountingEntityRepository accountingEntityRepository;

    public SupplierService(
            SupplierRepository supplierRepository,
            AccountingEntityRepository accountingEntityRepository
    ) {
        this.supplierRepository = supplierRepository;
        this.accountingEntityRepository = accountingEntityRepository;
    }

    @Transactional
    public SupplierResponse create(
            UUID entityId,
            UUID ownerId,
            CreateSupplierRequest request
    ) {

        AccountingEntity accountingEntity =
                getAccountingEntity(entityId, ownerId);

        String taxIdentifier =
                normalize(request.taxIdentifier());

        if (taxIdentifier != null &&
                supplierRepository
                        .existsByAccountingEntity_IdAndTaxIdentifier(
                                entityId,
                                taxIdentifier
                        )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe un proveedor con esa identificación"
            );
        }

        Supplier supplier = new Supplier(
                accountingEntity,
                request.type(),
                request.displayName().trim(),
                taxIdentifier,
                normalize(request.email()),
                normalize(request.phone()),
                normalize(request.address())
        );

        Supplier saved =
                supplierRepository.save(supplier);

        return toResponse(saved);
    }

    public List<SupplierResponse> findAll(
            UUID entityId,
            UUID ownerId
    ) {

        getAccountingEntity(entityId, ownerId);

        return supplierRepository
                .findByAccountingEntity_IdAndActiveTrueOrderByDisplayNameAsc(
                        entityId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SupplierResponse findById(
            UUID entityId,
            UUID supplierId,
            UUID ownerId
    ) {

        getAccountingEntity(entityId, ownerId);

        Supplier supplier =
                getSupplier(entityId, supplierId);

        return toResponse(supplier);
    }

    @Transactional
    public SupplierResponse update(
            UUID entityId,
            UUID supplierId,
            UUID ownerId,
            UpdateSupplierRequest request
    ) {

        getAccountingEntity(entityId, ownerId);

        Supplier supplier =
                getSupplier(entityId, supplierId);

        String taxIdentifier =
                normalize(request.taxIdentifier());

        if (taxIdentifier != null &&
                supplierRepository
                        .existsByAccountingEntity_IdAndTaxIdentifierAndIdNot(
                                entityId,
                                taxIdentifier,
                                supplierId
                        )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe otro proveedor con esa identificación"
            );
        }

        supplier.update(
                request.type(),
                request.displayName().trim(),
                taxIdentifier,
                normalize(request.email()),
                normalize(request.phone()),
                normalize(request.address())
        );

        return toResponse(supplier);
    }

    @Transactional
    public void deactivate(
            UUID entityId,
            UUID supplierId,
            UUID ownerId
    ) {

        getAccountingEntity(entityId, ownerId);

        Supplier supplier =
                getSupplier(entityId, supplierId);

        supplier.deactivate();
    }

    private AccountingEntity getAccountingEntity(
            UUID entityId,
            UUID ownerId
    ) {

        return accountingEntityRepository
                .findByIdAndOwner_IdAndActiveTrue(
                        entityId,
                        ownerId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Entidad contable no encontrada"
                        )
                );
    }

    private Supplier getSupplier(
            UUID entityId,
            UUID supplierId
    ) {

        return supplierRepository
                .findByIdAndAccountingEntity_IdAndActiveTrue(
                        supplierId,
                        entityId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Proveedor no encontrado"
                        )
                );
    }

    private SupplierResponse toResponse(
            Supplier supplier
    ) {

        return new SupplierResponse(
                supplier.getId(),
                supplier.getAccountingEntity().getId(),
                supplier.getType(),
                supplier.getDisplayName(),
                supplier.getTaxIdentifier(),
                supplier.getEmail(),
                supplier.getPhone(),
                supplier.getAddress(),
                supplier.isActive()
        );
    }

    private String normalize(String value) {

        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}