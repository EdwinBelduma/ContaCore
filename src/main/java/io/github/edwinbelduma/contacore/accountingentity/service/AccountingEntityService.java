package io.github.edwinbelduma.contacore.accountingentity.service;

import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.accountingentity.dto.AccountingEntityResponse;
import io.github.edwinbelduma.contacore.accountingentity.dto.CreateAccountingEntityRequest;
import io.github.edwinbelduma.contacore.accountingentity.dto.UpdateAccountingEntityRequest;
import io.github.edwinbelduma.contacore.accountingentity.repository.AccountingEntityRepository;
import io.github.edwinbelduma.contacore.user.domain.User;
import io.github.edwinbelduma.contacore.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class AccountingEntityService {

    private final AccountingEntityRepository accountingEntityRepository;
    private final UserRepository userRepository;

    public AccountingEntityService(
            AccountingEntityRepository accountingEntityRepository,
            UserRepository userRepository
    ) {
        this.accountingEntityRepository = accountingEntityRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AccountingEntityResponse create(
            Jwt jwt,
            CreateAccountingEntityRequest request
    ) {

        UUID userId = getUserId(jwt);

        User owner = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Usuario autenticado no encontrado"
                        )
                );

        String taxIdentifier =
                normalize(request.taxIdentifier());

        if (
                taxIdentifier != null
                        && accountingEntityRepository
                        .existsByTaxIdentifier(taxIdentifier)
        ) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una entidad con ese identificador tributario"
            );
        }

        AccountingEntity entity =
                new AccountingEntity(
                        request.type(),
                        request.displayName().trim(),
                        normalize(request.legalName()),
                        taxIdentifier,
                        owner
                );

        AccountingEntity saved =
                accountingEntityRepository.save(entity);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AccountingEntityResponse> findAllByCurrentUser(
            Jwt jwt
    ) {

        UUID userId = getUserId(jwt);

        return accountingEntityRepository
                .findByOwner_IdAndActiveTrue(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountingEntityResponse findById(
            Jwt jwt,
            UUID id
    ) {

        AccountingEntity entity =
                getActiveEntity(jwt, id);

        return toResponse(entity);
    }

    @Transactional
    public AccountingEntityResponse update(
            Jwt jwt,
            UUID id,
            UpdateAccountingEntityRequest request
    ) {

        AccountingEntity entity =
                getActiveEntity(jwt, id);

        String taxIdentifier =
                normalize(request.taxIdentifier());

        if (
                taxIdentifier != null
                        && accountingEntityRepository
                        .existsByTaxIdentifierAndIdNot(
                                taxIdentifier,
                                id
                        )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe otra entidad con ese identificador tributario"
            );
        }

        entity.update(
                request.type(),
                request.displayName().trim(),
                normalize(request.legalName()),
                taxIdentifier
        );

        return toResponse(entity);
    }

    @Transactional
    public void deactivate(
            Jwt jwt,
            UUID id
    ) {

        AccountingEntity entity =
                getActiveEntity(jwt, id);

        entity.deactivate();
    }

    private AccountingEntity getActiveEntity(
            Jwt jwt,
            UUID entityId
    ) {

        UUID userId = getUserId(jwt);

        return accountingEntityRepository
                .findByIdAndOwner_IdAndActiveTrue(
                        entityId,
                        userId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Entidad contable no encontrada"
                        )
                );
    }

    private UUID getUserId(Jwt jwt) {

        try {
            return UUID.fromString(
                    jwt.getSubject()
            );
        } catch (Exception exception) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Token de autenticación inválido"
            );
        }
    }

    private AccountingEntityResponse toResponse(
            AccountingEntity entity
    ) {

        return new AccountingEntityResponse(
                entity.getId(),
                entity.getType(),
                entity.getDisplayName(),
                entity.getLegalName(),
                entity.getTaxIdentifier(),
                entity.getCountryCode(),
                entity.isActive()
        );
    }

    private String normalize(
            String value
    ) {

        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}