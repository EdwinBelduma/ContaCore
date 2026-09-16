package io.github.edwinbelduma.contacore.accounting.account.service;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import io.github.edwinbelduma.contacore.accounting.account.domain.AccountNature;
import io.github.edwinbelduma.contacore.accounting.account.domain.AccountType;
import io.github.edwinbelduma.contacore.accounting.account.dto.AccountResponse;
import io.github.edwinbelduma.contacore.accounting.account.dto.CreateAccountRequest;
import io.github.edwinbelduma.contacore.accounting.account.dto.UpdateAccountRequest;
import io.github.edwinbelduma.contacore.accounting.account.repository.AccountRepository;
import io.github.edwinbelduma.contacore.accountingentity.domain.AccountingEntity;
import io.github.edwinbelduma.contacore.accountingentity.repository.AccountingEntityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final AccountingEntityRepository accountingEntityRepository;

    public AccountService(
            AccountRepository accountRepository,
            AccountingEntityRepository accountingEntityRepository
    ) {
        this.accountRepository = accountRepository;
        this.accountingEntityRepository = accountingEntityRepository;
    }

    @Transactional
    public AccountResponse create(
            Jwt jwt,
            UUID entityId,
            CreateAccountRequest request
    ) {

        AccountingEntity accountingEntity =
                getAccountingEntity(jwt, entityId);

        String code = request.code().trim();

        if (accountRepository
                .existsByAccountingEntity_IdAndCode(entityId, code)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una cuenta con ese código"
            );
        }

        Account parent = getParent(
                entityId,
                request.parentAccountId()
        );

        Account account = new Account(
                accountingEntity,
                code,
                request.name().trim(),
                request.type(),
                getNature(request.type()),
                parent,
                request.allowsEntries()
        );

        return toResponse(
                accountRepository.save(account)
        );
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> findAll(
            Jwt jwt,
            UUID entityId
    ) {

        getAccountingEntity(jwt, entityId);

        return accountRepository
                .findByAccountingEntity_IdAndActiveTrueOrderByCodeAsc(
                        entityId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse findById(
            Jwt jwt,
            UUID entityId,
            UUID accountId
    ) {

        getAccountingEntity(jwt, entityId);

        return toResponse(
                getAccount(entityId, accountId)
        );
    }

    @Transactional
    public AccountResponse update(
            Jwt jwt,
            UUID entityId,
            UUID accountId,
            UpdateAccountRequest request
    ) {

        getAccountingEntity(jwt, entityId);

        Account account =
                getAccount(entityId, accountId);

        String code = request.code().trim();

        if (accountRepository
                .existsByAccountingEntity_IdAndCodeAndIdNot(
                        entityId,
                        code,
                        accountId
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe otra cuenta con ese código"
            );
        }

        if (
                request.parentAccountId() != null
                        && request.parentAccountId().equals(accountId)
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Una cuenta no puede ser su propia cuenta padre"
            );
        }

        Account parent =
                getParent(
                        entityId,
                        request.parentAccountId()
                );

        account.update(
                code,
                request.name().trim(),
                request.type(),
                getNature(request.type()),
                parent,
                request.allowsEntries()
        );

        return toResponse(account);
    }

    @Transactional
    public void deactivate(
            Jwt jwt,
            UUID entityId,
            UUID accountId
    ) {

        getAccountingEntity(jwt, entityId);

        Account account =
                getAccount(entityId, accountId);

        account.deactivate();
    }

    private AccountingEntity getAccountingEntity(
            Jwt jwt,
            UUID entityId
    ) {

        UUID userId;

        try {
            userId = UUID.fromString(jwt.getSubject());
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Token inválido"
            );
        }

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

    private Account getParent(
            UUID entityId,
            UUID parentId
    ) {

        if (parentId == null) {
            return null;
        }

        return accountRepository
                .findByIdAndAccountingEntity_IdAndActiveTrue(
                        parentId,
                        entityId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "La cuenta padre no existe"
                        )
                );
    }

    private Account getAccount(
            UUID entityId,
            UUID accountId
    ) {

        return accountRepository
                .findByIdAndAccountingEntity_IdAndActiveTrue(
                        accountId,
                        entityId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cuenta contable no encontrada"
                        )
                );
    }

    private AccountNature getNature(
            AccountType type
    ) {

        return switch (type) {

            case ASSET, EXPENSE ->
                    AccountNature.DEBIT;

            case LIABILITY, EQUITY, INCOME ->
                    AccountNature.CREDIT;
        };
    }

    private AccountResponse toResponse(
            Account account
    ) {

        UUID parentId =
                account.getParent() == null
                        ? null
                        : account.getParent().getId();

        return new AccountResponse(
                account.getId(),
                account.getAccountingEntity().getId(),
                account.getCode(),
                account.getName(),
                account.getType(),
                account.getNature(),
                parentId,
                account.isAllowsEntries(),
                account.isActive()
        );
    }
}