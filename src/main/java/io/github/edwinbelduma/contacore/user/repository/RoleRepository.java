package io.github.edwinbelduma.contacore.user.repository;

import io.github.edwinbelduma.contacore.user.domain.Role;
import io.github.edwinbelduma.contacore.user.domain.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(RoleName name);

    boolean existsByName(RoleName name);
}