import api from './api'

export type ExpenseStatus =
    | 'DRAFT'
    | 'POSTED'
    | 'VOIDED'

export interface Expense {
    id: string
    accountingEntityId: string
    supplierId: string | null
    expenseDate: string
    description: string
    reference: string | null
    amount: number
    expenseAccountId: string
    paymentAccountId: string
    status: ExpenseStatus
    journalEntryId: string | null
}

export interface CreateExpenseRequest {
    supplierId: string | null
    expenseDate: string
    description: string
    reference: string | null
    amount: number
    expenseAccountId: string
    paymentAccountId: string
}

/*
 * Obtener todos los gastos
 */
export async function getExpenses(
    entityId: string,
): Promise<Expense[]> {
    const response =
        await api.get<Expense[]>(
            `/accounting-entities/${entityId}/expenses`,
        )

    return response.data
}

/*
 * Crear un gasto.
 * Se crea inicialmente como DRAFT.
 */
export async function createExpense(
    entityId: string,
    request: CreateExpenseRequest,
): Promise<Expense> {
    const response =
        await api.post<Expense>(
            `/accounting-entities/${entityId}/expenses`,
            request,
        )

    return response.data
}

/*
 * Contabilizar gasto.
 *
 * DRAFT -> POSTED
 */
export async function postExpense(
    entityId: string,
    expenseId: string,
): Promise<Expense> {
    const response =
        await api.post<Expense>(
            `/accounting-entities/${entityId}/expenses/${expenseId}/post`,
        )

    return response.data
}

/*
 * Anular gasto.
 *
 * POSTED -> VOIDED
 */
export async function voidExpense(
    entityId: string,
    expenseId: string,
): Promise<Expense> {
    const response =
        await api.post<Expense>(
            `/accounting-entities/${entityId}/expenses/${expenseId}/void`,
        )

    return response.data
}