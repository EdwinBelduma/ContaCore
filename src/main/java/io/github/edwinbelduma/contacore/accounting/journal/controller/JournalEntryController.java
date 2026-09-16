package io.github.edwinbelduma.contacore.accounting.journal.controller;

import io.github.edwinbelduma.contacore.accounting.journal.dto.CreateJournalEntryRequest;
import io.github.edwinbelduma.contacore.accounting.journal.dto.JournalEntryResponse;
import io.github.edwinbelduma.contacore.accounting.journal.service.JournalEntryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(
        "/api/accounting-entities/{entityId}/journal-entries"
)
public class JournalEntryController {

    private final JournalEntryService journalEntryService;

    public JournalEntryController(
            JournalEntryService journalEntryService
    ) {
        this.journalEntryService =
                journalEntryService;
    }

    @PostMapping
    public ResponseEntity<JournalEntryResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,
            @Valid
            @RequestBody
            CreateJournalEntryRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        journalEntryService.create(
                                jwt,
                                entityId,
                                request
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<JournalEntryResponse>> findAll(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId
    ) {

        return ResponseEntity.ok(
                journalEntryService.findAll(
                        jwt,
                        entityId
                )
        );
    }

    @GetMapping("/{entryId}")
    public ResponseEntity<JournalEntryResponse> findById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,
            @PathVariable UUID entryId
    ) {

        return ResponseEntity.ok(
                journalEntryService.findById(
                        jwt,
                        entityId,
                        entryId
                )
        );
    }
}