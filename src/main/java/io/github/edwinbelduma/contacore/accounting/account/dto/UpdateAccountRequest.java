package io.github.edwinbelduma.contacore.accounting.account.dto;

import io.github.edwinbelduma.contacore.accounting.account.domain.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateAccountRequest(

        @NotBlank(message = "El código de la cuenta es obligatorio")
        @Size(max = 30)
        String code,

        @NotBlank(message = "El nombre de la cuenta es obligatorio")
        @Size(max = 150)
        String name,

        @NotNull(message = "El tipo de cuenta es obligatorio")
        AccountType type,

        UUID parentAccountId,

        boolean allowsEntries

) {
}