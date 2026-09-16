package io.github.edwinbelduma.contacore.customer.dto;

import io.github.edwinbelduma.contacore.customer.domain.CustomerType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCustomerRequest(

        @NotNull(message = "El tipo de cliente es obligatorio")
        CustomerType type,

        @NotBlank(message = "El nombre del cliente es obligatorio")
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