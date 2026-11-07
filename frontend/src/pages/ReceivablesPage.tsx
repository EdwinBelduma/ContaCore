import {
    CircleDollarSign,
    Clock3,
    Eye,
    Plus,
    Search,
    WalletCards,
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

import {
    getObligations,
    type Obligation,
} from '../services/obligationService'

function ReceivablesPage() {
    const navigate =
        useNavigate()

    const [
        entity,
        setEntity,
    ] =
        useState<AccountingEntity | null>(
            null,
        )

    const [
        obligations,
        setObligations,
    ] =
        useState<Obligation[]>([])

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
     * CARGAR CUENTAS POR COBRAR
     */

    useEffect(() => {
        const loadData =
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
                     * 2. Obtener cuentas por cobrar
                     * y clientes
                     */

                    const [
                        obligationList,
                        customerList,
                    ] =
                        await Promise.all([
                            getObligations(
                                selectedEntity.id,
                                'RECEIVABLE',
                            ),

                            getCustomers(
                                selectedEntity.id,
                            ),
                        ])

                    setObligations(
                        obligationList ??
                        [],
                    )

                    setCustomers(
                        customerList ??
                        [],
                    )
                } catch (
                    exception
                    ) {
                    console.error(
                        'Error cargando cuentas por cobrar:',
                        exception,
                    )

                    setError(
                        'No fue posible cargar las cuentas por cobrar.',
                    )
                } finally {
                    setLoading(false)
                }
            }

        loadData()
    }, [])

    /*
     * NOMBRE DEL CLIENTE
     */

    const getCustomerName =
        (
            customerId:
                string | null,
        ) => {
            if (!customerId) {
                return 'Sin cliente'
            }

            const customer =
                customers.find(
                    (item) =>
                        item.id ===
                        customerId,
                )

            return (
                customer?.displayName ??
                'Cliente no encontrado'
            )
        }

    /*
     * FORMATO MONEDA
     */

    const formatCurrency =
        (
            value: number,
        ) =>
            new Intl.NumberFormat(
                'en-US',
                {
                    style:
                        'currency',
                    currency:
                        'USD',
                },
            ).format(
                Number(value),
            )

    /*
     * FORMATO FECHA
     */

    const formatDate =
        (
            value: string,
        ) => {
            if (!value) {
                return '-'
            }

            return new Intl.DateTimeFormat(
                'es-EC',
                {
                    year:
                        'numeric',
                    month:
                        '2-digit',
                    day:
                        '2-digit',
                },
            ).format(
                new Date(
                    `${value}T00:00:00`,
                ),
            )
        }

    /*
     * TEXTO DEL ESTADO
     */

    const getStatusLabel =
        (
            status: string,
        ) => {
            switch (status) {
                case 'PENDING':
                    return 'Pendiente'

                case 'PARTIALLY_PAID':
                    return 'Cobro parcial'

                case 'PAID':
                    return 'Cobrada'

                case 'OVERDUE':
                    return 'Vencida'

                case 'VOIDED':
                    return 'Anulada'

                default:
                    return status
            }
        }

    /*
     * COLOR DEL ESTADO
     */

    const getStatusClass =
        (
            status: string,
        ) => {
            switch (status) {
                case 'PAID':
                    return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'

                case 'PARTIALLY_PAID':
                    return 'border-amber-400/20 bg-amber-500/10 text-amber-300'

                case 'OVERDUE':
                    return 'border-rose-400/20 bg-rose-500/10 text-rose-300'

                case 'VOIDED':
                    return 'border-slate-600 bg-slate-800 text-slate-400'

                default:
                    return 'border-blue-400/20 bg-blue-500/10 text-blue-300'
            }
        }

    /*
     * FILTRAR CUENTAS
     */

    const filteredObligations =
        useMemo(
            () => {
                const normalizedSearch =
                    search
                        .trim()
                        .toLowerCase()

                if (
                    !normalizedSearch
                ) {
                    return obligations
                }

                return obligations.filter(
                    (
                        obligation,
                    ) => {
                        const customerName =
                            getCustomerName(
                                obligation.customerId,
                            )

                        const searchableText =
                            [
                                customerName,
                                obligation.description,
                                obligation.reference,
                                obligation.status,
                            ]
                                .filter(
                                    Boolean,
                                )
                                .join(' ')
                                .toLowerCase()

                        return searchableText.includes(
                            normalizedSearch,
                        )
                    },
                )
            },
            [
                obligations,
                customers,
                search,
            ],
        )

    /*
     * TOTAL PENDIENTE
     */

    const totalReceivable =
        useMemo(
            () =>
                obligations
                    .filter(
                        (item) =>
                            item.status !==
                            'VOIDED',
                    )
                    .reduce(
                        (
                            total,
                            item,
                        ) =>
                            total +
                            Number(
                                item.outstandingAmount,
                            ),
                        0,
                    ),
            [
                obligations,
            ],
        )

    /*
     * TOTAL VENCIDO
     */

    const overdueTotal =
        useMemo(
            () =>
                obligations
                    .filter(
                        (item) =>
                            item.status ===
                            'OVERDUE',
                    )
                    .reduce(
                        (
                            total,
                            item,
                        ) =>
                            total +
                            Number(
                                item.outstandingAmount,
                            ),
                        0,
                    ),
            [
                obligations,
            ],
        )

    /*
     * TOTAL COBRADO
     */

    const paidTotal =
        useMemo(
            () =>
                obligations
                    .filter(
                        (item) =>
                            item.status !==
                            'VOIDED',
                    )
                    .reduce(
                        (
                            total,
                            item,
                        ) =>
                            total +
                            Number(
                                item.paidAmount,
                            ),
                        0,
                    ),
            [
                obligations,
            ],
        )

    /*
     * CARGANDO
     */

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando cuentas por cobrar...
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
                        Gestión financiera
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Cuentas por cobrar
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        {entity
                            ? `Valores pendientes de cobro en ${entity.displayName}.`
                            : 'Gestiona las cuentas por cobrar de tus clientes.'}
                    </p>

                </div>

                {/* NUEVA CUENTA */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/cuentas-por-cobrar/nueva',
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500"
                >
                    <Plus
                        size={18}
                    />

                    Nueva cuenta por cobrar
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

                {/* PENDIENTE */}

                <article className="rounded-2xl border border-blue-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Por cobrar
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {formatCurrency(
                                    totalReceivable,
                                )}
                            </p>

                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                            <WalletCards
                                size={26}
                            />

                        </div>

                    </div>

                </article>

                {/* VENCIDO */}

                <article className="rounded-2xl border border-rose-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Vencidas
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {formatCurrency(
                                    overdueTotal,
                                )}
                            </p>

                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">

                            <Clock3
                                size={26}
                            />

                        </div>

                    </div>

                </article>

                {/* COBRADO */}

                <article className="rounded-2xl border border-emerald-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Cobrado
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {formatCurrency(
                                    paidTotal,
                                )}
                            </p>

                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">

                            <CircleDollarSign
                                size={26}
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
                            Cuentas registradas
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Historial de valores por cobrar a clientes.
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
                            placeholder="Buscar cuenta..."
                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                        />

                    </div>

                </div>

                {/* SIN CUENTAS */}

                {obligations.length ===
                0 ? (
                    <div className="px-6 py-16 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                            <WalletCards
                                size={28}
                            />

                        </div>

                        <h3 className="mt-5 text-lg font-bold">
                            No hay cuentas por cobrar
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Registra una cuenta por cobrar para controlar los valores pendientes de tus clientes.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/cuentas-por-cobrar/nueva',
                                )
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                        >

                            <Plus
                                size={18}
                            />

                            Nueva cuenta por cobrar

                        </button>

                    </div>
                ) : filteredObligations.length ===
                0 ? (
                    <div className="px-6 py-14 text-center">

                        <Search
                            size={30}
                            className="mx-auto text-slate-600"
                        />

                        <p className="mt-4 font-semibold">
                            No se encontraron cuentas
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Intenta utilizar otro término de búsqueda.
                        </p>

                    </div>
                ) : (

                    /* TABLA */

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1150px]">

                            <thead>

                            <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                                <th className="px-6 py-4">
                                    Cliente
                                </th>

                                <th className="px-6 py-4">
                                    Descripción
                                </th>

                                <th className="px-6 py-4">
                                    Vencimiento
                                </th>

                                <th className="px-6 py-4 text-right">
                                    Total
                                </th>

                                <th className="px-6 py-4 text-right">
                                    Cobrado
                                </th>

                                <th className="px-6 py-4 text-right">
                                    Pendiente
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

                            {filteredObligations.map(
                                (
                                    obligation,
                                ) => (
                                    <tr
                                        key={
                                            obligation.id
                                        }
                                        className="border-b border-slate-800/80 transition last:border-b-0 hover:bg-slate-800/20"
                                    >

                                        {/* CLIENTE */}

                                        <td className="px-6 py-5">

                                            <p className="font-semibold text-white">
                                                {getCustomerName(
                                                    obligation.customerId,
                                                )}
                                            </p>

                                            {obligation.reference && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Ref.{' '}
                                                    {
                                                        obligation.reference
                                                    }
                                                </p>
                                            )}

                                        </td>

                                        {/* DESCRIPCIÓN */}

                                        <td className="px-6 py-5 text-sm text-slate-300">

                                            {
                                                obligation.description
                                            }

                                        </td>

                                        {/* VENCIMIENTO */}

                                        <td className="px-6 py-5 text-sm text-slate-300">

                                            {formatDate(
                                                obligation.dueDate,
                                            )}

                                        </td>

                                        {/* TOTAL */}

                                        <td className="px-6 py-5 text-right text-sm font-semibold text-white">

                                            {formatCurrency(
                                                Number(
                                                    obligation.totalAmount,
                                                ),
                                            )}

                                        </td>

                                        {/* COBRADO */}

                                        <td className="px-6 py-5 text-right text-sm font-semibold text-emerald-300">

                                            {formatCurrency(
                                                Number(
                                                    obligation.paidAmount,
                                                ),
                                            )}

                                        </td>

                                        {/* PENDIENTE */}

                                        <td className="px-6 py-5 text-right text-sm font-bold text-blue-300">

                                            {formatCurrency(
                                                Number(
                                                    obligation.outstandingAmount,
                                                ),
                                            )}

                                        </td>

                                        {/* ESTADO */}

                                        <td className="px-6 py-5">

                        <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                obligation.status,
                            )}`}
                        >
                          {getStatusLabel(
                              obligation.status,
                          )}
                        </span>

                                        </td>

                                        {/* ACCIONES */}

                                        <td className="px-6 py-5 text-right">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/cuentas-por-cobrar/${obligation.id}`,
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                                            >

                                                <Eye
                                                    size={15}
                                                />

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

export default ReceivablesPage