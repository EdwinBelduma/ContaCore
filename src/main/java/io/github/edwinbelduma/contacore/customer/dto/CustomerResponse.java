package io.github.edwinbelduma.contacore.customer.dto;

import io.github.edwinbelduma.contacore.customer.domain.CustomerType;

import java.util.UUID;

public record CustomerResponse(

        UUID id,
        UUID accountingEntityId,
        CustomerType type,
        String displayName,
        String taxIdentifier,
        String email,
        String phone,
        String address,
        boolean active

) {
}