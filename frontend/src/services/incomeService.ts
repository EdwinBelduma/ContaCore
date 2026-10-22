import api from './api'

export type IncomeStatus =
    | 'DRAFT'
    | 'POSTED'
    | 'VOIDED'

export interface Income {
    id: string
    accountingEntityId: string
    customerId: string | null
    incomeDate: string
    description: string
    reference: string | null
    amount: number
    incomeAccountId: string
    receiptAccountId: string
    status: IncomeStatus
    journalEntryId: string | null
}

export async function getIncomes(
    entityId: string,
): Promise<Income[]> {
    const response =
        await api.get<Income[]>(
            `/accounting-entities/${entityId}/incomes`,
        )

    return response.data
}