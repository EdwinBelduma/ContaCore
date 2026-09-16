package io.github.edwinbelduma.contacore.accounting.journal.repository;

import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntry;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JournalEntryRepository
        extends JpaRepository<JournalEntry, UUID> {

    List<JournalEntry>
    findByAccountingEntity_IdOrderByEntryDateDescCreatedAtDesc(
            UUID accountingEntityId
    );

    Optional<JournalEntry>
    findByIdAndAccountingEntity_Id(
            UUID id,
            UUID accountingEntityId
    );

    @EntityGraph(
            attributePaths = {
                    "lines",
                    "lines.account"
            }
    )
    List<JournalEntry>
    findByAccountingEntity_IdAndStatusAndEntryDateBetweenOrderByEntryDateAscCreatedAtAsc(
            UUID accountingEntityId,
            JournalEntryStatus status,
            LocalDate from,
            LocalDate to
    );
}