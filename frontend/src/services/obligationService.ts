import api from './api'

export type ObligationType =
    | 'RECEIVABLE'
    | 'PAYABLE'

export type ObligationStatus =
    | 'PENDING'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'OVERDUE'
    | 'VOIDED'

export type ObligationPaymentStatus =
    | 'POSTED'
    | 'VOIDED'

export interface Obligation {
    id: string
    accountingEntityId: string
    type: ObligationType

    customerId: string | null
    supplierId: string | null

    issueDate: string
    dueDate: string

    description: string
    reference: string | null

    totalAmount: number
    paidAmount: number
    outstandingAmount: number

    status: ObligationStatus

    obligationAccountId: string
    counterpartAccountId: string

    journalEntryId: string | null
}

export interface CreateObligationRequest {
    type: ObligationType

    customerId: string | null
    supplierId: string | null

    issueDate: string
    dueDate: string

    description: string
    reference: string | null

    obligationAccountId: string
    counterpartAccountId: string

    totalAmount: number
}

export interface UpdateObligationRequest {
    customerId: string | null
    supplierId: string | null

    issueDate: string
    dueDate: string

    description: string
    reference: string | null

    totalAmount: number
}

export interface ObligationPayment {
    id: string
    obligationId: string

    paymentDate: string
    amount: number

    cashAccountId: string

    status: ObligationPaymentStatus

    journalEntryId: string | null
}

export interface RegisterObligationPaymentRequest {
    paymentDate: string
    amount: number

    cashAccountId: string
    obligationAccountId: string
}

/*
 * LISTAR OBLIGACIONES
 */

export async function getObligations(
    entityId: string,
    type?: ObligationType,
    status?: ObligationStatus,
): Promise<Obligation[]> {
    const response =
        await api.get<Obligation[]>(
            `/accounting-entities/${entityId}/obligations`,
            {
                params: {
                    type,
                    status,
                },
            },
        )

    return response.data
}

/*
 * OBTENER UNA OBLIGACIÓN
 */

export async function getObligationById(
    entityId: string,
    obligationId: string,
): Promise<Obligation> {
    const response =
        await api.get<Obligation>(
            `/accounting-entities/${entityId}/obligations/${obligationId}`,
        )

    return response.data
}

/*
 * CREAR OBLIGACIÓN
 */

export async function createObligation(
    entityId: string,
    request: CreateObligationRequest,
): Promise<Obligation> {
    const response =
        await api.post<Obligation>(
            `/accounting-entities/${entityId}/obligations`,
            request,
        )

    return response.data
}

/*
 * ACTUALIZAR OBLIGACIÓN
 */

export async function updateObligation(
    entityId: string,
    obligationId: string,
    request: UpdateObligationRequest,
): Promise<Obligation> {
    const response =
        await api.put<Obligation>(
            `/accounting-entities/${entityId}/obligations/${obligationId}`,
            request,
        )

    return response.data
}

/*
 * ANULAR OBLIGACIÓN
 */

export async function voidObligation(
    entityId: string,
    obligationId: string,
): Promise<Obligation> {
    const response =
        await api.post<Obligation>(
            `/accounting-entities/${entityId}/obligations/${obligationId}/void`,
        )

    return response.data
}

/*
 * LISTAR PAGOS / COBROS
 */

export async function getObligationPayments(
    entityId: string,
    obligationId: string,
): Promise<ObligationPayment[]> {
    const response =
        await api.get<ObligationPayment[]>(
            `/accounting-entities/${entityId}/obligations/${obligationId}/payments`,
        )

    return response.data
}

/*
 * REGISTRAR PAGO / COBRO
 */

export async function registerObligationPayment(
    entityId: string,
    obligationId: string,
    request: RegisterObligationPaymentRequest,
): Promise<ObligationPayment> {
    const response =
        await api.post<ObligationPayment>(
            `/accounting-entities/${entityId}/obligations/${obligationId}/payments`,
            request,
        )

    return response.data
}

/*
 * ANULAR PAGO / COBRO
 */

export async function voidObligationPayment(
    entityId: string,
    obligationId: string,
    paymentId: string,
): Promise<ObligationPayment> {
    const response =
        await api.post<ObligationPayment>(
            `/accounting-entities/${entityId}/obligations/${obligationId}/payments/${paymentId}/void`,
        )

    return response.data
}
