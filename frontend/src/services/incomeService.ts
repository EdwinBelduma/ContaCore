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

export interface CreateIncomeRequest {
    customerId: string | null
    incomeDate: string
    description: string
    reference: string | null
    amount: number
    incomeAccountId: string
    receiptAccountId: string
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

export async function createIncome(
    entityId: string,
    request: CreateIncomeRequest,
): Promise<Income> {
    const response =
        await api.post<Income>(
            `/accounting-entities/${entityId}/incomes`,
            request,
        )

    return response.data
}

export async function postIncome(
    entityId: string,
    incomeId: string,
): Promise<Income> {
    const response =
        await api.post<Income>(
            `/accounting-entities/${entityId}/incomes/${incomeId}/post`,
        )

    return response.data
}

/*
 * Anular un ingreso contabilizado.
 *
 * POSTED -> VOIDED
 */
export async function voidIncome(
    entityId: string,
    incomeId: string,
): Promise<Income> {
    const response =
        await api.post<Income>(
            `/accounting-entities/${entityId}/incomes/${incomeId}/void`,
        )

    return response.data
}