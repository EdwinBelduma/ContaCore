import api from './api'

/* =========================================================
   LIBRO DIARIO
========================================================= */

export interface JournalReportLine {
    lineNumber: number
    accountCode: string
    accountName: string
    description: string | null
    debit: number
    credit: number
}

export interface JournalReportEntry {
    id: string
    entryDate: string
    description: string
    reference: string | null
    totalDebit: number
    totalCredit: number
    lines: JournalReportLine[]
}

export interface JournalReportResponse {
    accountingEntityId: string
    accountingEntityName: string
    from: string
    to: string
    totalDebit: number
    totalCredit: number
    entries: JournalReportEntry[]
}

/* =========================================================
   LIBRO MAYOR
========================================================= */

export interface LedgerMovement {
    entryDate: string
    journalEntryId: string
    reference: string | null
    description: string
    debit: number
    credit: number
    balance: number
}

export interface LedgerReportResponse {
    accountingEntityId: string
    accountingEntityName: string

    accountId: string
    accountCode: string
    accountName: string
    nature: string

    from: string
    to: string

    openingBalance: number
    totalDebit: number
    totalCredit: number
    closingBalance: number

    movements: LedgerMovement[]
}

/* =========================================================
   BALANZA DE COMPROBACIÓN
========================================================= */

export interface TrialBalanceAccount {
    accountId: string
    accountCode: string
    accountName: string
    type: string
    nature: string

    totalDebit: number
    totalCredit: number

    debitBalance: number
    creditBalance: number
}

export interface TrialBalanceReportResponse {
    accountingEntityId: string
    accountingEntityName: string

    from: string
    to: string

    totalDebit: number
    totalCredit: number

    totalDebitBalance: number
    totalCreditBalance: number

    balanced: boolean

    accounts: TrialBalanceAccount[]
}

/* =========================================================
   PETICIONES
========================================================= */

export async function getJournalReport(
    entityId: string,
    from: string,
    to: string,
): Promise<JournalReportResponse> {
    const response =
        await api.get<JournalReportResponse>(
            `/accounting-entities/${entityId}/reports/journal`,
            {
                params: {
                    from,
                    to,
                },
            },
        )

    return response.data
}

export async function getLedgerReport(
    entityId: string,
    accountId: string,
    from: string,
    to: string,
): Promise<LedgerReportResponse> {
    const response =
        await api.get<LedgerReportResponse>(
            `/accounting-entities/${entityId}/reports/ledger/${accountId}`,
            {
                params: {
                    from,
                    to,
                },
            },
        )

    return response.data
}

export async function getTrialBalanceReport(
    entityId: string,
    from: string,
    to: string,
): Promise<TrialBalanceReportResponse> {
    const response =
        await api.get<TrialBalanceReportResponse>(
            `/accounting-entities/${entityId}/reports/trial-balance`,
            {
                params: {
                    from,
                    to,
                },
            },
        )

    return response.data
}