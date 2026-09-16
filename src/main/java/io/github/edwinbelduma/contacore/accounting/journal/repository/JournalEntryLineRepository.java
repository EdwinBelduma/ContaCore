package io.github.edwinbelduma.contacore.accounting.journal.repository;

import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryLine;
import io.github.edwinbelduma.contacore.accounting.journal.domain.JournalEntryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface JournalEntryLineRepository
        extends JpaRepository<JournalEntryLine, UUID> {

    @Query("""
            SELECT line
            FROM JournalEntryLine line
            JOIN FETCH line.journalEntry entry
            JOIN FETCH line.account account
            WHERE entry.accountingEntity.id = :entityId
              AND account.id = :accountId
              AND entry.status = :status
              AND entry.entryDate < :from
            ORDER BY
                entry.entryDate ASC,
                entry.createdAt ASC,
                line.lineNumber ASC
            """)
    List<JournalEntryLine> findBeforeDate(
            @Param("entityId") UUID entityId,
            @Param("accountId") UUID accountId,
            @Param("status") JournalEntryStatus status,
            @Param("from") LocalDate from
    );

    @Query("""
            SELECT line
            FROM JournalEntryLine line
            JOIN FETCH line.journalEntry entry
            JOIN FETCH line.account account
            WHERE entry.accountingEntity.id = :entityId
              AND account.id = :accountId
              AND entry.status = :status
              AND entry.entryDate BETWEEN :from AND :to
            ORDER BY
                entry.entryDate ASC,
                entry.createdAt ASC,
                line.lineNumber ASC
            """)
    List<JournalEntryLine> findBetweenDates(
            @Param("entityId") UUID entityId,
            @Param("accountId") UUID accountId,
            @Param("status") JournalEntryStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            SELECT line
            FROM JournalEntryLine line
            JOIN FETCH line.journalEntry entry
            JOIN FETCH line.account account
            WHERE entry.accountingEntity.id = :entityId
              AND entry.status = :status
              AND entry.entryDate BETWEEN :from AND :to
            ORDER BY
                account.code ASC,
                entry.entryDate ASC,
                entry.createdAt ASC,
                line.lineNumber ASC
            """)
    List<JournalEntryLine> findAllBetweenDates(
            @Param("entityId") UUID entityId,
            @Param("status") JournalEntryStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            SELECT line
            FROM JournalEntryLine line
            JOIN FETCH line.journalEntry entry
            JOIN FETCH line.account account
            WHERE entry.accountingEntity.id = :entityId
              AND entry.status = :status
              AND entry.entryDate <= :asOf
            ORDER BY
                account.code ASC,
                entry.entryDate ASC,
                entry.createdAt ASC,
                line.lineNumber ASC
            """)
    List<JournalEntryLine> findAllUpToDate(
            @Param("entityId") UUID entityId,
            @Param("status") JournalEntryStatus status,
            @Param("asOf") LocalDate asOf
    );
}