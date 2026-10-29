import api from './api'

export interface Account {
    id: string
    accountingEntityId: string
    code: string
    name: string
    type: string
    nature: string
    parentAccountId: string | null
    allowsEntries: boolean
    active: boolean
}

export async function getAccounts(
    entityId: string,
): Promise<Account[]> {
    const response =
        await api.get<Account[]>(
            `/accounting-entities/${entityId}/accounts`,
        )

    return response.data
}