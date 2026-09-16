package io.github.edwinbelduma.contacore.accounting.account.dto;

import io.github.edwinbelduma.contacore.accounting.account.domain.AccountNature;
import io.github.edwinbelduma.contacore.accounting.account.domain.AccountType;

import java.util.UUID;

public record AccountResponse(

        UUID id,
        UUID accountingEntityId,
        String code,
        String name,
        AccountType type,
        AccountNature nature,
        UUID parentAccountId,
        boolean allowsEntries,
        boolean active

) {
}