import api from './api'

export interface DashboardSummary {
    totalIncome: number
    totalExpenses: number
    netResult: number
    totalReceivable: number
    totalPayable: number
    overdueObligations: number
}

export interface DashboardMovement {
    id: string
    type: 'INCOME' | 'EXPENSE'
    date: string
    description: string
    reference: string | null
    amount: number
}

export async function getDashboardSummary(
    entityId: string,
): Promise<DashboardSummary> {
    const response =
        await api.get<DashboardSummary>(
            `/accounting-entities/${entityId}/dashboard/summary`,
        )

    return response.data
}

export async function getRecentMovements(
    entityId: string,
): Promise<DashboardMovement[]> {
    const response =
        await api.get<DashboardMovement[]>(
            `/accounting-entities/${entityId}/dashboard/recent-movements`,
        )

    return response.data
}