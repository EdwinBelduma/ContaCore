package io.github.edwinbelduma.contacore.bootstrap;

import io.github.edwinbelduma.contacore.user.domain.Role;
import io.github.edwinbelduma.contacore.user.domain.RoleName;
import io.github.edwinbelduma.contacore.user.domain.User;
import io.github.edwinbelduma.contacore.user.repository.RoleRepository;
import io.github.edwinbelduma.contacore.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
@Order(2)
public class AdminDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${APP_ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${APP_ADMIN_PASSWORD:}")
    private String adminPassword;

    public AdminDataInitializer(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {

        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            return;
        }

        String normalizedEmail =
                adminEmail.trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return;
        }

        Role adminRole = roleRepository
                .findByName(RoleName.ADMIN)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "El rol ADMIN no existe"
                        )
                );

        User admin = new User(
                normalizedEmail,
                passwordEncoder.encode(adminPassword),
                "Administrador",
                "ContaCore"
        );

        admin.addRole(adminRole);

        userRepository.save(admin);
    }
}