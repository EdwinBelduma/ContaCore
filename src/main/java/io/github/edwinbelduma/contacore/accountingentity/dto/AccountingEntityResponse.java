package io.github.edwinbelduma.contacore.accountingentity.dto;

import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntityType;

import java.util.UUID;

public record AccountingEntityResponse(

        UUID id,
        AccountingEntityType type,
        String displayName,
        String legalName,
        String taxIdentifier,
        String countryCode,
        boolean active

) {
}