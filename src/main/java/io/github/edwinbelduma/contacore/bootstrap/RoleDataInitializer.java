package io.github.edwinbelduma.contacore.bootstrap;

import io.github.edwinbelduma.contacore.user.domain.Role;
import io.github.edwinbelduma.contacore.user.domain.RoleName;
import io.github.edwinbelduma.contacore.user.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class RoleDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public RoleDataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {

        createRoleIfNotExists(
                RoleName.ADMIN,
                "Administrador general del sistema"
        );

        createRoleIfNotExists(
                RoleName.ACCOUNTANT,
                "Contador responsable de la gestión contable"
        );

        createRoleIfNotExists(
                RoleName.ASSISTANT,
                "Auxiliar contable"
        );

        createRoleIfNotExists(
                RoleName.MANAGER,
                "Gerente con acceso a información financiera"
        );

        createRoleIfNotExists(
                RoleName.AUDITOR,
                "Auditor con acceso de consulta y revisión"
        );
    }

    private void createRoleIfNotExists(
            RoleName name,
            String description
    ) {
        if (!roleRepository.existsByName(name)) {
            roleRepository.save(
                    new Role(name, description)
            );
        }
    }
}