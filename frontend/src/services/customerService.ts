import api from './api'

export interface Customer {
    id: string
    accountingEntityId: string
    type: string
    displayName: string
    taxIdentifier: string | null
    email: string | null
    phone: string | null
    address: string | null
    active: boolean
}

export async function getCustomers(
    entityId: string,
): Promise<Customer[]> {
    const response =
        await api.get<Customer[]>(
            `/accounting-entities/${entityId}/customers`,
        )

    return response.data
}