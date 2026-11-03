import api from './api'

export type CustomerType =
    | 'NATURAL_PERSON'
    | 'COMPANY'

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

export interface CreateCustomerRequest {
    type: CustomerType
    displayName: string
    taxIdentifier: string | null
    email: string | null
    phone: string | null
    address: string | null
}

export interface UpdateCustomerRequest {
    type: CustomerType
    displayName: string
    taxIdentifier: string | null
    email: string | null
    phone: string | null
    address: string | null
}

/*
 * LISTAR CLIENTES
 */

export async function getCustomers(
    entityId: string,
): Promise<Customer[]> {
    const response =
        await api.get<Customer[]>(
            `/accounting-entities/${entityId}/customers`,
        )

    return response.data
}

/*
 * BUSCAR UN CLIENTE
 */

export async function getCustomerById(
    entityId: string,
    customerId: string,
): Promise<Customer> {
    const customers =
        await getCustomers(
            entityId,
        )

    const customer =
        customers.find(
            (item) =>
                item.id === customerId,
        )

    if (!customer) {
        throw new Error(
            'Cliente no encontrado.',
        )
    }

    return customer
}

/*
 * CREAR CLIENTE
 */

export async function createCustomer(
    entityId: string,
    request: CreateCustomerRequest,
): Promise<Customer> {
    const response =
        await api.post<Customer>(
            `/accounting-entities/${entityId}/customers`,
            request,
        )

    return response.data
}

/*
 * ACTUALIZAR CLIENTE
 */

export async function updateCustomer(
    entityId: string,
    customerId: string,
    request: UpdateCustomerRequest,
): Promise<Customer> {
    const response =
        await api.put<Customer>(
            `/accounting-entities/${entityId}/customers/${customerId}`,
            request,
        )

    return response.data
}