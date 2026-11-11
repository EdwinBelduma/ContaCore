import api from './api'

export type JournalEntryStatus =
    | 'DRAFT'
    | 'POSTED'
    | 'VOIDED'

export interface JournalEntryLine {
    id: string
    lineNumber: number
    accountId: string
    accountCode: string
    accountName: string
    description: string | null
    debit: number
    credit: number
}

export interface JournalEntry {
    id: string
    accountingEntityId: string
    entryDate: string
    description: string
    reference: string | null
    status: JournalEntryStatus
    totalDebit: number
    totalCredit: number
    lines: JournalEntryLine[]
}

export interface CreateJournalEntryLineRequest {
    accountId: string
    description: string | null
    debit: number
    credit: number
}

export interface CreateJournalEntryRequest {
    entryDate: string
    description: string
    reference: string | null
    lines: CreateJournalEntryLineRequest[]
}

/*
 * LISTAR ASIENTOS CONTABLES
 */

export async function getJournalEntries(
    entityId: string,
): Promise<JournalEntry[]> {
    const response =
        await api.get<JournalEntry[]>(
            `/accounting-entities/${entityId}/journal-entries`,
        )

    return response.data
}

/*
 * OBTENER UN ASIENTO
 */

export async function getJournalEntryById(
    entityId: string,
    journalEntryId: string,
): Promise<JournalEntry> {
    const response =
        await api.get<JournalEntry>(
            `/accounting-entities/${entityId}/journal-entries/${journalEntryId}`,
        )

    return response.data
}

/*
 * CREAR ASIENTO CONTABLE
 */

export async function createJournalEntry(
    entityId: string,
    request: CreateJournalEntryRequest,
): Promise<JournalEntry> {
    const response =
        await api.post<JournalEntry>(
            `/accounting-entities/${entityId}/journal-entries`,
            request,
        )

    return response.data
}