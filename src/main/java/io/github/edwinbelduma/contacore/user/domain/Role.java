package io.github.edwinbelduma.contacore.user.domain;

import io.github.edwinbelduma.contacore.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "roles")
public class Role extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 50)
    private RoleName name;

    @Column(length = 150)
    private String description;

    protected Role() {
    }

    public Role(RoleName name, String description) {
        this.name = name;
        this.description = description;
    }

    public RoleName getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public void updateDescription(String description) {
        this.description = description;
    }
}