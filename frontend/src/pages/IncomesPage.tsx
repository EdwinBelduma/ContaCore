import {
    ArrowLeft,
    CalendarDays,
    CircleDollarSign,
    FileText,
    Plus,
    Search,
    TrendingUp,
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
    getDashboardSummary,
} from '../services/dashboardService'

import {
    getIncomes,
    type Income,
    type IncomeStatus,
} from '../services/incomeService'

function IncomesPage() {
    const navigate = useNavigate()

    const [entity, setEntity] =
        useState<AccountingEntity | null>(
            null,
        )

    const [incomes, setIncomes] =
        useState<Income[]>([])

    const [totalIncome, setTotalIncome] =
        useState(0)

    const [search, setSearch] =
        useState('')

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    useEffect(() => {
        const loadIncomes = async () => {
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
                        (item) => item.active,
                    ) ?? entities[0]

                setEntity(
                    selectedEntity,
                )

                /*
                 * 2. Cargar ingresos
                 * y resumen financiero
                 */

                const [
                    incomeList,
                    summary,
                ] = await Promise.all([
                    getIncomes(
                        selectedEntity.id,
                    ),

                    getDashboardSummary(
                        selectedEntity.id,
                    ),
                ])

                setIncomes(
                    incomeList ?? [],
                )

                setTotalIncome(
                    summary.totalIncome ?? 0,
                )
            } catch (exception) {
                console.error(
                    'Error cargando ingresos:',
                    exception,
                )

                setError(
                    'No fue posible cargar los ingresos.',
                )
            } finally {
                setLoading(false)
            }
        }

        loadIncomes()
    }, [])

    const formatMoney = (
        value?: number | null,
    ) => {
        return new Intl.NumberFormat(
            'es-EC',
            {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
            },
        ).format(value ?? 0)
    }

    const formatDate = (
        value?: string | null,
    ) => {
        if (!value) {
            return '-'
        }

        const date =
            new Date(
                `${value}T00:00:00`,
            )

        return new Intl.DateTimeFormat(
            'es-EC',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            },
        ).format(date)
    }

    const getStatusLabel = (
        status: IncomeStatus,
    ) => {
        switch (status) {
            case 'DRAFT':
                return 'Borrador'

            case 'POSTED':
                return 'Contabilizado'

            case 'VOIDED':
                return 'Anulado'

            default:
                return status
        }
    }

    const getStatusClasses = (
        status: IncomeStatus,
    ) => {
        switch (status) {
            case 'POSTED':
                return `
          border-emerald-400/20
          bg-emerald-500/10
          text-emerald-300
        `

            case 'DRAFT':
                return `
          border-amber-400/20
          bg-amber-500/10
          text-amber-300
        `

            case 'VOIDED':
                return `
          border-rose-400/20
          bg-rose-500/10
          text-rose-300
        `

            default:
                return `
          border-slate-700
          bg-slate-800
          text-slate-300
        `
        }
    }

    const filteredIncomes =
        useMemo(() => {
            const term =
                search
                    .trim()
                    .toLowerCase()

            if (!term) {
                return incomes
            }

            return incomes.filter(
                (income) => {
                    const description =
                        income.description
                            ?.toLowerCase() ?? ''

                    const reference =
                        income.reference
                            ?.toLowerCase() ?? ''

                    const status =
                        getStatusLabel(
                            income.status,
                        ).toLowerCase()

                    return (
                        description.includes(
                            term,
                        ) ||
                        reference.includes(
                            term,
                        ) ||
                        status.includes(
                            term,
                        )
                    )
                },
            )
        }, [incomes, search])

    const postedCount =
        incomes.filter(
            (income) =>
                income.status ===
                'POSTED',
        ).length

    /*
     * Cargando
     */

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#020817] text-white">

                <div className="text-center">

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando ingresos...
                    </p>

                </div>

            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#020817] text-white">

            {/* =====================================
          HEADER
      ====================================== */}

            <header className="border-b border-slate-800/80 bg-[#061126]">

                <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-lg font-black shadow-lg shadow-blue-600/20">
                            C
                        </div>

                        <div>

                            <h1 className="font-bold">
                                ContaCore
                            </h1>

                            <p className="text-xs text-slate-500">
                                Gestión contable inteligente
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/dashboard',
                            )
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/5 hover:text-white"
                    >
                        <ArrowLeft
                            size={17}
                        />

                        Volver al Dashboard
                    </button>

                </div>

            </header>

            {/* =====================================
          CONTENIDO
      ====================================== */}

            <section className="mx-auto max-w-[1500px] px-6 py-8">

                {/* Cabecera */}

                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                    <div>

                        <p className="text-sm font-semibold text-emerald-400">
                            Gestión financiera
                        </p>

                        <h2 className="mt-1 text-3xl font-black">
                            Ingresos
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">

                            {entity
                                ? `Ingresos registrados en ${entity.displayName}.`
                                : 'Administra tus ingresos.'}

                        </p>

                    </div>

                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#02140d] shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-400"
                    >
                        <Plus size={18} />

                        Nuevo ingreso
                    </button>

                </div>

                {/* Error */}

                {error && (
                    <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                        {error}
                    </div>
                )}

                {/* =====================================
            TARJETAS
        ====================================== */}

                <div className="mt-8 grid gap-4 md:grid-cols-3">

                    {/* Total */}

                    <article className="rounded-2xl border border-emerald-400/20 bg-[#071329] p-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-400">
                                    Total contabilizado
                                </p>

                                <p className="mt-3 text-3xl font-black">
                                    {formatMoney(
                                        totalIncome,
                                    )}
                                </p>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">

                                <TrendingUp
                                    size={23}
                                />

                            </div>

                        </div>

                    </article>

                    {/* Registros */}

                    <article className="rounded-2xl border border-blue-400/20 bg-[#071329] p-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-400">
                                    Registros
                                </p>

                                <p className="mt-3 text-3xl font-black">
                                    {incomes.length}
                                </p>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                                <CircleDollarSign
                                    size={23}
                                />

                            </div>

                        </div>

                    </article>

                    {/* Contabilizados */}

                    <article className="rounded-2xl border border-cyan-400/20 bg-[#071329] p-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-400">
                                    Contabilizados
                                </p>

                                <p className="mt-3 text-3xl font-black">
                                    {postedCount}
                                </p>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">

                                <FileText
                                    size={23}
                                />

                            </div>

                        </div>

                    </article>

                </div>

                {/* =====================================
            TABLA
        ====================================== */}

                <article className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">

                    {/* Cabecera tabla */}

                    <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 md:flex-row md:items-center md:justify-between">

                        <div>

                            <h3 className="font-bold">
                                Ingresos registrados
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Historial de ingresos de la entidad contable.
                            </p>

                        </div>

                        {/* Buscador */}

                        <div className="relative">

                            <Search
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Buscar ingreso..."
                                className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-2.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/40 md:w-[280px]"
                            />

                        </div>

                    </div>

                    {/* Sin registros */}

                    {filteredIncomes.length === 0 ? (

                        <div className="flex min-h-[270px] items-center justify-center px-6">

                            <div className="text-center">

                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">

                                    <TrendingUp
                                        size={25}
                                    />

                                </div>

                                <p className="mt-4 font-semibold">
                                    No hay ingresos para mostrar
                                </p>

                                <p className="mt-2 text-sm text-slate-500">

                                    {search
                                        ? 'No encontramos ingresos que coincidan con tu búsqueda.'
                                        : 'Cuando registres ingresos aparecerán aquí.'}

                                </p>

                            </div>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[900px]">

                                <thead>

                                <tr className="border-b border-slate-800 bg-[#081427] text-left text-xs uppercase tracking-wider text-slate-500">

                                    <th className="px-6 py-4">
                                        Fecha
                                    </th>

                                    <th className="px-6 py-4">
                                        Descripción
                                    </th>

                                    <th className="px-6 py-4">
                                        Referencia
                                    </th>

                                    <th className="px-6 py-4">
                                        Estado
                                    </th>

                                    <th className="px-6 py-4 text-right">
                                        Monto
                                    </th>

                                </tr>

                                </thead>

                                <tbody className="divide-y divide-slate-800">

                                {filteredIncomes.map(
                                    (income) => (

                                        <tr
                                            key={income.id}
                                            className="transition hover:bg-slate-800/20"
                                        >

                                            {/* Fecha */}

                                            <td className="whitespace-nowrap px-6 py-4">

                                                <div className="flex items-center gap-2 text-sm text-slate-300">

                                                    <CalendarDays
                                                        size={15}
                                                        className="text-slate-500"
                                                    />

                                                    {formatDate(
                                                        income.incomeDate,
                                                    )}

                                                </div>

                                            </td>

                                            {/* Descripción */}

                                            <td className="px-6 py-4">

                                                <p className="max-w-[350px] truncate text-sm font-semibold text-slate-200">
                                                    {income.description}
                                                </p>

                                            </td>

                                            {/* Referencia */}

                                            <td className="px-6 py-4 text-sm text-slate-400">

                                                {income.reference ||
                                                    'Sin referencia'}

                                            </td>

                                            {/* Estado */}

                                            <td className="px-6 py-4">

                          <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                  income.status,
                              )}`}
                          >
                            {getStatusLabel(
                                income.status,
                            )}
                          </span>

                                            </td>

                                            {/* Monto */}

                                            <td className="whitespace-nowrap px-6 py-4 text-right">

                          <span className="font-bold text-emerald-400">
                            {formatMoney(
                                income.amount,
                            )}
                          </span>

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

        </main>
    )
}

export default IncomesPage