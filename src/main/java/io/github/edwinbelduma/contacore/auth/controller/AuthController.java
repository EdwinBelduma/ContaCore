package io.github.edwinbelduma.contacore.auth.controller;

import io.github.edwinbelduma.contacore.auth.dto.CurrentUserResponse;
import io.github.edwinbelduma.contacore.auth.dto.LoginRequest;
import io.github.edwinbelduma.contacore.auth.dto.LoginResponse;
import io.github.edwinbelduma.contacore.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> me(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                authService.getCurrentUser(jwt)
        );
    }
}