import api from './api'

export interface AccountingEntity {
    id: string
    type: string
    displayName: string
    legalName: string
    countryCode: string
    active: boolean
}

export async function getAccountingEntities(): Promise<
    AccountingEntity[]
> {
    const response =
        await api.get<AccountingEntity[]>(
            '/accounting-entities',
        )

    return response.data
}