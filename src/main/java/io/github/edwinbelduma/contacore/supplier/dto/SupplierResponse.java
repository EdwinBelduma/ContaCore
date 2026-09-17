package io.github.edwinbelduma.contacore.supplier.dto;

import io.github.edwinbelduma.contacore.supplier.domain.SupplierType;

import java.util.UUID;

public record SupplierResponse(

        UUID id,

        UUID accountingEntityId,

        SupplierType type,

        String displayName,

        String taxIdentifier,

        String email,

        String phone,

        String address,

        boolean active

) {
}
