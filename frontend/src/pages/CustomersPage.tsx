import {
    Building2,
    Mail,
    Phone,
    Plus,
    Search,
    UserRoundCheck,
    Users,
} from 'lucide-react'

import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    useNavigate,
} from 'react-router-dom'

import {
    getAccountingEntities,
    type AccountingEntity,
} from '../services/accountingEntityService'

import {
    getCustomers,
    type Customer,
} from '../services/customerService'

function CustomersPage() {
    const navigate = useNavigate()

    const [
        entity,
        setEntity,
    ] =
        useState<AccountingEntity | null>(
            null,
        )

    const [
        customers,
        setCustomers,
    ] =
        useState<Customer[]>([])

    const [
        search,
        setSearch,
    ] =
        useState('')

    const [
        loading,
        setLoading,
    ] =
        useState(true)

    const [
        error,
        setError,
    ] =
        useState('')

    /*
     * CARGAR CLIENTES
     */

    useEffect(() => {
        const loadCustomers =
            async () => {
                try {
                    setLoading(true)
                    setError('')

                    /*
                     * 1. Obtener entidad contable
                     */

                    const entities =
                        await getAccountingEntities()

                    if (
                        !entities ||
                        entities.length === 0
                    ) {
                        setError(
                            'No existe una entidad contable disponible.',
                        )

                        return
                    }

                    const selectedEntity =
                        entities.find(
                            (item) =>
                                item.active,
                        ) ??
                        entities[0]

                    setEntity(
                        selectedEntity,
                    )

                    /*
                     * 2. Obtener clientes
                     */

                    const customerList =
                        await getCustomers(
                            selectedEntity.id,
                        )

                    setCustomers(
                        customerList ?? [],
                    )
                } catch (
                    exception
                    ) {
                    console.error(
                        'Error cargando clientes:',
                        exception,
                    )

                    setError(
                        'No fue posible cargar los clientes.',
                    )
                } finally {
                    setLoading(false)
                }
            }

        loadCustomers()
    }, [])

    /*
     * CLIENTES FILTRADOS
     */

    const filteredCustomers =
        useMemo(
            () => {
                const normalizedSearch =
                    search
                        .trim()
                        .toLowerCase()

                if (!normalizedSearch) {
                    return customers
                }

                return customers.filter(
                    (customer) => {
                        const searchableText =
                            [
                                customer.displayName,
                                customer.taxIdentifier,
                                customer.email,
                                customer.phone,
                                customer.type,
                            ]
                                .filter(Boolean)
                                .join(' ')
                                .toLowerCase()

                        return searchableText.includes(
                            normalizedSearch,
                        )
                    },
                )
            },
            [
                customers,
                search,
            ],
        )

    /*
     * ESTADÍSTICAS
     */

    const activeCustomers =
        useMemo(
            () =>
                customers.filter(
                    (customer) =>
                        customer.active,
                ).length,
            [customers],
        )

    const inactiveCustomers =
        useMemo(
            () =>
                customers.filter(
                    (customer) =>
                        !customer.active,
                ).length,
            [customers],
        )

    /*
     * TEXTO PARA TIPO DE CLIENTE
     */

    const getCustomerTypeLabel =
        (
            type: string,
        ) => {
            switch (type) {
                case 'PERSON':
                    return 'Persona'

                case 'INDIVIDUAL':
                    return 'Persona natural'

                case 'COMPANY':
                    return 'Empresa'

                case 'BUSINESS':
                    return 'Empresa'

                default:
                    return type
            }
        }

    /*
     * CARGANDO
     */

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando clientes...
                    </p>

                </div>

            </div>
        )
    }

    return (
        <section className="px-6 py-7 xl:px-8">

            {/* CABECERA */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <p className="text-sm font-semibold text-blue-400">
                        Gestión comercial
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Clientes
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                        {entity
                            ? `Clientes registrados en ${entity.displayName}.`
                            : 'Gestiona los clientes de tu entidad contable.'}

                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/clientes/nuevo',
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500"
                >
                    <Plus
                        size={18}
                    />

                    Nuevo cliente
                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* TARJETAS */}

            <div className="mt-8 grid gap-5 md:grid-cols-3">

                {/* TOTAL */}

                <article className="rounded-2xl border border-blue-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Total clientes
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {customers.length}
                            </p>

                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                            <Users
                                size={25}
                            />

                        </div>

                    </div>

                </article>

                {/* ACTIVOS */}

                <article className="rounded-2xl border border-emerald-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Activos
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {activeCustomers}
                            </p>

                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">

                            <UserRoundCheck
                                size={25}
                            />

                        </div>

                    </div>

                </article>

                {/* INACTIVOS */}

                <article className="rounded-2xl border border-slate-700 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Inactivos
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {inactiveCustomers}
                            </p>

                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">

                            <Users
                                size={25}
                            />

                        </div>

                    </div>

                </article>

            </div>

            {/* TABLA */}

            <article className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">

                {/* CABECERA TABLA */}

                <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <h3 className="font-bold">
                            Clientes registrados
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Historial de clientes de la entidad contable.
                        </p>

                    </div>

                    {/* BUSCADOR */}

                    <div className="relative w-full lg:w-80">

                        <Search
                            size={18}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="text"
                            value={
                                search
                            }
                            onChange={(
                                event,
                            ) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Buscar cliente..."
                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                        />

                    </div>

                </div>

                {/* SIN CLIENTES */}

                {customers.length === 0 ? (
                    <div className="px-6 py-16 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                            <Users
                                size={28}
                            />

                        </div>

                        <h3 className="mt-5 text-lg font-bold">
                            No hay clientes registrados
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Comienza registrando tu primer cliente para asociarlo posteriormente a ingresos, obligaciones y otros movimientos.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/clientes/nuevo',
                                )
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                        >
                            <Plus
                                size={18}
                            />

                            Registrar cliente
                        </button>

                    </div>
                ) : filteredCustomers.length ===
                0 ? (
                    <div className="px-6 py-14 text-center">

                        <Search
                            size={30}
                            className="mx-auto text-slate-600"
                        />

                        <p className="mt-4 font-semibold">
                            No se encontraron clientes
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Intenta utilizar otro término de búsqueda.
                        </p>

                    </div>
                ) : (

                    /*
                     * TABLA
                     */

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[950px]">

                            <thead>

                            <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                                <th className="px-6 py-4">
                                    Cliente
                                </th>

                                <th className="px-6 py-4">
                                    Identificación
                                </th>

                                <th className="px-6 py-4">
                                    Contacto
                                </th>

                                <th className="px-6 py-4">
                                    Tipo
                                </th>

                                <th className="px-6 py-4">
                                    Estado
                                </th>

                                <th className="px-6 py-4 text-right">
                                    Acciones
                                </th>

                            </tr>

                            </thead>

                            <tbody>

                            {filteredCustomers.map(
                                (
                                    customer,
                                ) => (
                                    <tr
                                        key={
                                            customer.id
                                        }
                                        className="border-b border-slate-800/80 transition last:border-b-0 hover:bg-slate-800/20"
                                    >

                                        {/* CLIENTE */}

                                        <td className="px-6 py-5">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                                                    {customer.type ===
                                                    'COMPANY' ||
                                                    customer.type ===
                                                    'BUSINESS' ? (
                                                        <Building2
                                                            size={19}
                                                        />
                                                    ) : (
                                                        <Users
                                                            size={19}
                                                        />
                                                    )}

                                                </div>

                                                <div>

                                                    <p className="font-semibold text-white">
                                                        {
                                                            customer.displayName
                                                        }
                                                    </p>

                                                    {customer.address && (
                                                        <p className="mt-1 max-w-[260px] truncate text-xs text-slate-500">
                                                            {
                                                                customer.address
                                                            }
                                                        </p>
                                                    )}

                                                </div>

                                            </div>

                                        </td>

                                        {/* IDENTIFICACIÓN */}

                                        <td className="px-6 py-5 text-sm text-slate-300">

                                            {customer.taxIdentifier ||
                                                (
                                                    <span className="text-slate-600">
                              Sin identificación
                            </span>
                                                )}

                                        </td>

                                        {/* CONTACTO */}

                                        <td className="px-6 py-5">

                                            <div className="space-y-2 text-sm">

                                                {customer.email ? (
                                                    <div className="flex items-center gap-2 text-slate-300">

                                                        <Mail
                                                            size={15}
                                                            className="text-slate-500"
                                                        />

                                                        <span>
                                {
                                    customer.email
                                }
                              </span>

                                                    </div>
                                                ) : null}

                                                {customer.phone ? (
                                                    <div className="flex items-center gap-2 text-slate-300">

                                                        <Phone
                                                            size={15}
                                                            className="text-slate-500"
                                                        />

                                                        <span>
                                {
                                    customer.phone
                                }
                              </span>

                                                    </div>
                                                ) : null}

                                                {!customer.email &&
                                                    !customer.phone && (
                                                        <span className="text-slate-600">
                              Sin contacto
                            </span>
                                                    )}

                                            </div>

                                        </td>

                                        {/* TIPO */}

                                        <td className="px-6 py-5 text-sm text-slate-300">

                                            {
                                                getCustomerTypeLabel(
                                                    customer.type,
                                                )
                                            }

                                        </td>

                                        {/* ESTADO */}

                                        <td className="px-6 py-5">

                                            {customer.active ? (
                                                <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            Activo
                          </span>
                                            ) : (
                                                <span className="inline-flex rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                            Inactivo
                          </span>
                                            )}

                                        </td>

                                        {/* ACCIONES */}

                                        <td className="px-6 py-5 text-right">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/clientes/${customer.id}`,
                                                    )
                                                }
                                                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                                            >
                                                Ver detalle
                                            </button>

                                        </td>

                                    </tr>
                                ),
                            )}

                            </tbody>

                        </table>

                    </div>
                )}

            </article>

        </section>
    )
}

export default CustomersPage