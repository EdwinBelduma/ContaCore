package io.github.edwinbelduma.contacore.accounting.account.repository;

import io.github.edwinbelduma.contacore.accounting.account.domain.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository
        extends JpaRepository<Account, UUID> {

    List<Account> findByAccountingEntity_IdAndActiveTrueOrderByCodeAsc(
            UUID accountingEntityId
    );

    Optional<Account> findByIdAndAccountingEntity_IdAndActiveTrue(
            UUID id,
            UUID accountingEntityId
    );

    Optional<Account> findByIdAndAccountingEntity_Id(
            UUID id,
            UUID accountingEntityId
    );

    boolean existsByAccountingEntity_IdAndCode(
            UUID accountingEntityId,
            String code
    );

    boolean existsByAccountingEntity_IdAndCodeAndIdNot(
            UUID accountingEntityId,
            String code,
            UUID id
    );
}