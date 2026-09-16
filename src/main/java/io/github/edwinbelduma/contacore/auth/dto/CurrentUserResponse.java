package io.github.edwinbelduma.contacore.auth.dto;

import java.util.Set;
import java.util.UUID;

public record CurrentUserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        Set<String> roles
) {
}