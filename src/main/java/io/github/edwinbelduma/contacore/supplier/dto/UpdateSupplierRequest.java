package io.github.edwinbelduma.contacore.supplier.dto;

import io.github.edwinbelduma.contacore.supplier.domain.SupplierType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateSupplierRequest(

        @NotNull(message = "El tipo de proveedor es obligatorio")
        SupplierType type,

        @NotBlank(message = "El nombre del proveedor es obligatorio")
        @Size(
                max = 180,
                message = "El nombre no puede superar 180 caracteres"
        )
        String displayName,

        @Size(
                max = 30,
                message = "La identificación no puede superar 30 caracteres"
        )
        String taxIdentifier,

        @Email(message = "El correo electrónico no es válido")
        @Size(
                max = 180,
                message = "El correo no puede superar 180 caracteres"
        )
        String email,

        @Size(
                max = 30,
                message = "El teléfono no puede superar 30 caracteres"
        )
        String phone,

        @Size(
                max = 255,
                message = "La dirección no puede superar 255 caracteres"
        )
        String address

) {
}