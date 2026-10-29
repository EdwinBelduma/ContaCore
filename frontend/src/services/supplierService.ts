import api from './api'

export interface Supplier {
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

/*
 * Obtener todos los proveedores
 * de una entidad contable.
 */
export async function getSuppliers(
    entityId: string,
): Promise<Supplier[]> {
    const response =
        await api.get<Supplier[]>(
            `/accounting-entities/${entityId}/suppliers`,
        )

    return response.data
}