package io.github.edwinbelduma.contacore.accounting.report.controller;

import io.github.edwinbelduma.contacore.accounting.report.dto.BalanceSheetReportResponse;
import io.github.edwinbelduma.contacore.accounting.report.dto.IncomeStatementReportResponse;
import io.github.edwinbelduma.contacore.accounting.report.dto.JournalReportResponse;
import io.github.edwinbelduma.contacore.accounting.report.dto.LedgerReportResponse;
import io.github.edwinbelduma.contacore.accounting.report.dto.TrialBalanceReportResponse;

import io.github.edwinbelduma.contacore.accounting.report.service.BalanceSheetReportService;
import io.github.edwinbelduma.contacore.accounting.report.service.IncomeStatementReportService;
import io.github.edwinbelduma.contacore.accounting.report.service.JournalReportService;
import io.github.edwinbelduma.contacore.accounting.report.service.LedgerReportService;
import io.github.edwinbelduma.contacore.accounting.report.service.TrialBalanceReportService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping(
        "/api/accounting-entities/{entityId}/reports"
)
public class AccountingReportController {

    private final JournalReportService journalReportService;
    private final LedgerReportService ledgerReportService;
    private final TrialBalanceReportService trialBalanceReportService;
    private final IncomeStatementReportService incomeStatementReportService;
    private final BalanceSheetReportService balanceSheetReportService;

    public AccountingReportController(
            JournalReportService journalReportService,
            LedgerReportService ledgerReportService,
            TrialBalanceReportService trialBalanceReportService,
            IncomeStatementReportService incomeStatementReportService,
            BalanceSheetReportService balanceSheetReportService
    ) {

        this.journalReportService =
                journalReportService;

        this.ledgerReportService =
                ledgerReportService;

        this.trialBalanceReportService =
                trialBalanceReportService;

        this.incomeStatementReportService =
                incomeStatementReportService;

        this.balanceSheetReportService =
                balanceSheetReportService;
    }

    @GetMapping("/journal")
    public ResponseEntity<JournalReportResponse> journal(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        return ResponseEntity.ok(
                journalReportService.generate(
                        jwt,
                        entityId,
                        from,
                        to
                )
        );
    }

    @GetMapping("/ledger/{accountId}")
    public ResponseEntity<LedgerReportResponse> ledger(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,
            @PathVariable UUID accountId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        return ResponseEntity.ok(
                ledgerReportService.generate(
                        jwt,
                        entityId,
                        accountId,
                        from,
                        to
                )
        );
    }

    @GetMapping("/trial-balance")
    public ResponseEntity<TrialBalanceReportResponse> trialBalance(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        return ResponseEntity.ok(
                trialBalanceReportService.generate(
                        jwt,
                        entityId,
                        from,
                        to
                )
        );
    }

    @GetMapping("/income-statement")
    public ResponseEntity<IncomeStatementReportResponse> incomeStatement(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        return ResponseEntity.ok(
                incomeStatementReportService.generate(
                        jwt,
                        entityId,
                        from,
                        to
                )
        );
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<BalanceSheetReportResponse> balanceSheet(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID entityId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate asOf
    ) {

        return ResponseEntity.ok(
                balanceSheetReportService.generate(
                        jwt,
                        entityId,
                        asOf
                )
        );
    }
}