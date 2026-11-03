import api from './api'

export type SupplierType =
    | 'NATURAL_PERSON'
    | 'COMPANY'

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

export interface CreateSupplierRequest {
    type: SupplierType
    displayName: string
    taxIdentifier: string | null
    email: string | null
    phone: string | null
    address: string | null
}

export interface UpdateSupplierRequest {
    type: SupplierType
    displayName: string
    taxIdentifier: string | null
    email: string | null
    phone: string | null
    address: string | null
}

/*
 * LISTAR PROVEEDORES
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

/*
 * BUSCAR UN PROVEEDOR
 */

export async function getSupplierById(
    entityId: string,
    supplierId: string,
): Promise<Supplier> {
    const suppliers =
        await getSuppliers(
            entityId,
        )

    const supplier =
        suppliers.find(
            (item) =>
                item.id === supplierId,
        )

    if (!supplier) {
        throw new Error(
            'Proveedor no encontrado.',
        )
    }

    return supplier
}

/*
 * CREAR PROVEEDOR
 */

export async function createSupplier(
    entityId: string,
    request: CreateSupplierRequest,
): Promise<Supplier> {
    const response =
        await api.post<Supplier>(
            `/accounting-entities/${entityId}/suppliers`,
            request,
        )

    return response.data
}

/*
 * ACTUALIZAR PROVEEDOR
 */

export async function updateSupplier(
    entityId: string,
    supplierId: string,
    request: UpdateSupplierRequest,
): Promise<Supplier> {
    const response =
        await api.put<Supplier>(
            `/accounting-entities/${entityId}/suppliers/${supplierId}`,
            request,
        )

    return response.data
}