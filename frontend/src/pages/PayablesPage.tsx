import {
    Building2,
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
    getSuppliers,
    type Supplier,
} from '../services/supplierService'

import {
    getObligations,
    type Obligation,
} from '../services/obligationService'

function PayablesPage() {
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
        suppliers,
        setSuppliers,
    ] =
        useState<Supplier[]>([])

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
     * CARGAR CUENTAS POR PAGAR
     */

    useEffect(() => {
        const loadData =
            async () => {
                try {
                    setLoading(true)
                    setError('')

                    /*
                     * OBTENER ENTIDAD
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
                     * CARGAR CUENTAS POR PAGAR
                     * Y PROVEEDORES
                     */

                    const [
                        obligationList,
                        supplierList,
                    ] =
                        await Promise.all([
                            getObligations(
                                selectedEntity.id,
                                'PAYABLE',
                            ),

                            getSuppliers(
                                selectedEntity.id,
                            ),
                        ])

                    setObligations(
                        obligationList ??
                        [],
                    )

                    setSuppliers(
                        supplierList ??
                        [],
                    )
                } catch (
                    exception
                    ) {
                    console.error(
                        'Error cargando cuentas por pagar:',
                        exception,
                    )

                    setError(
                        'No fue posible cargar las cuentas por pagar.',
                    )
                } finally {
                    setLoading(false)
                }
            }

        loadData()
    }, [])

    /*
     * OBTENER NOMBRE DEL PROVEEDOR
     */

    const getSupplierName =
        (
            supplierId:
                string | null,
        ) => {
            if (!supplierId) {
                return 'Sin proveedor'
            }

            const supplier =
                suppliers.find(
                    (item) =>
                        item.id ===
                        supplierId,
                )

            return (
                supplier?.displayName ??
                'Proveedor no encontrado'
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
                    return 'Pago parcial'

                case 'PAID':
                    return 'Pagada'

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
                    return 'border-violet-400/20 bg-violet-500/10 text-violet-300'
            }
        }

    /*
     * BUSCADOR
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
                        const supplierName =
                            getSupplierName(
                                obligation.supplierId,
                            )

                        const searchableText =
                            [
                                supplierName,
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
                suppliers,
                search,
            ],
        )

    /*
     * TOTAL POR PAGAR
     */

    const totalPayable =
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
     * TOTAL PAGADO
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

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando cuentas por pagar...
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

                    <p className="text-sm font-semibold text-violet-400">
                        Gestión financiera
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Cuentas por pagar
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        {entity
                            ? `Valores pendientes de pago en ${entity.displayName}.`
                            : 'Gestiona las obligaciones pendientes con tus proveedores.'}
                    </p>

                </div>

                {/* NUEVA CUENTA POR PAGAR */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/cuentas-por-pagar/nueva',
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/10 transition hover:bg-violet-500"
                >

                    <Plus
                        size={18}
                    />

                    Nueva cuenta por pagar

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

                {/* POR PAGAR */}

                <article className="rounded-2xl border border-violet-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Por pagar
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {formatCurrency(
                                    totalPayable,
                                )}
                            </p>

                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">

                            <WalletCards
                                size={26}
                            />

                        </div>

                    </div>

                </article>

                {/* VENCIDAS */}

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

                {/* PAGADO */}

                <article className="rounded-2xl border border-emerald-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Pagado
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
                            Historial de obligaciones pendientes con proveedores.
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
                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                        />

                    </div>

                </div>

                {/* SIN CUENTAS */}

                {obligations.length ===
                0 ? (
                    <div className="px-6 py-16 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">

                            <Building2
                                size={28}
                            />

                        </div>

                        <h3 className="mt-5 text-lg font-bold">
                            No hay cuentas por pagar
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Registra una obligación para controlar los valores pendientes con tus proveedores.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/cuentas-por-pagar/nueva',
                                )
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500"
                        >

                            <Plus
                                size={18}
                            />

                            Nueva cuenta por pagar

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

                    /* TABLA DE CUENTAS */

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1150px]">

                            <thead>

                            <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                                <th className="px-6 py-4">
                                    Proveedor
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
                                    Pagado
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

                                        {/* PROVEEDOR */}

                                        <td className="px-6 py-5">

                                            <p className="font-semibold text-white">
                                                {getSupplierName(
                                                    obligation.supplierId,
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

                                        {/* PAGADO */}

                                        <td className="px-6 py-5 text-right text-sm font-semibold text-emerald-300">

                                            {formatCurrency(
                                                Number(
                                                    obligation.paidAmount,
                                                ),
                                            )}

                                        </td>

                                        {/* PENDIENTE */}

                                        <td className="px-6 py-5 text-right text-sm font-bold text-violet-300">

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
                                                        `/cuentas-por-pagar/${obligation.id}`,
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
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

export default PayablesPage