package io.github.edwinbelduma.contacore.accountingentity.dto;

import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAccountingEntityRequest(

        @NotNull(message = "El tipo de entidad es obligatorio")
        AccountingEntityType type,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
        String displayName,

        @Size(max = 200, message = "La razón social no puede superar 200 caracteres")
        String legalName,

        @Size(max = 30, message = "El identificador tributario no puede superar 30 caracteres")
        String taxIdentifier

) {
}