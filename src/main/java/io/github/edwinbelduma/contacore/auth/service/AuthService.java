package io.github.edwinbelduma.contacore.auth.service;

import io.github.edwinbelduma.contacore.auth.dto.CurrentUserResponse;
import io.github.edwinbelduma.contacore.auth.dto.LoginRequest;
import io.github.edwinbelduma.contacore.auth.dto.LoginResponse;
import io.github.edwinbelduma.contacore.security.jwt.JwtService;
import io.github.edwinbelduma.contacore.user.domain.User;
import io.github.edwinbelduma.contacore.user.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Correo o contraseña incorrectos"
                        )
                );

        if (!user.isActive()) {
            throw new BadCredentialsException(
                    "La cuenta se encuentra desactivada"
            );
        }

        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        )) {
            throw new BadCredentialsException(
                    "Correo o contraseña incorrectos"
            );
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                "Bearer",
                jwtService.getExpirationSeconds()
        );
    }

    public CurrentUserResponse getCurrentUser(Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "El usuario autenticado no existe"
                        )
                );

        if (!user.isActive()) {
            throw new BadCredentialsException(
                    "La cuenta se encuentra desactivada"
            );
        }

        Set<String> roles = user.getRoles()
                .stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return new CurrentUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roles
        );
    }
}