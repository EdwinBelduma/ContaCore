import {
    CircleDollarSign,
    ReceiptText,
    ShieldCheck,
    TrendingDown,
    TrendingUp,
    WalletCards,
} from 'lucide-react'

import {
    useEffect,
    useState,
} from 'react'

import {
    getAccountingEntities,
    type AccountingEntity,
} from '../services/accountingEntityService'

import {
    getDashboardSummary,
    getRecentMovements,
    type DashboardMovement,
    type DashboardSummary,
} from '../services/dashboardService'

function DashboardPage() {
    const [entity, setEntity] =
        useState<AccountingEntity | null>(
            null,
        )

    const [summary, setSummary] =
        useState<DashboardSummary | null>(
            null,
        )

    const [movements, setMovements] =
        useState<DashboardMovement[]>([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true)
                setError('')

                const entities =
                    await getAccountingEntities()

                if (
                    !entities ||
                    entities.length === 0
                ) {
                    setError(
                        'No tienes una entidad contable registrada.',
                    )

                    return
                }

                const selectedEntity =
                    entities.find(
                        (item) => item.active,
                    ) ?? entities[0]

                setEntity(selectedEntity)

                const [
                    dashboardSummary,
                    recentMovements,
                ] = await Promise.all([
                    getDashboardSummary(
                        selectedEntity.id,
                    ),

                    getRecentMovements(
                        selectedEntity.id,
                    ),
                ])

                setSummary(
                    dashboardSummary,
                )

                setMovements(
                    recentMovements ?? [],
                )
            } catch (exception) {
                console.error(
                    'Error cargando dashboard:',
                    exception,
                )

                setError(
                    'No fue posible cargar la información del Dashboard.',
                )
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
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
            return ''
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

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-500/20 border-t-cyan-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando información contable...
                    </p>

                </div>

            </div>
        )
    }

    const income =
        summary?.totalIncome ?? 0

    const expenses =
        summary?.totalExpenses ?? 0

    const netResult =
        summary?.netResult ?? 0

    const receivable =
        summary?.totalReceivable ?? 0

    const payable =
        summary?.totalPayable ?? 0

    const overdue =
        summary?.overdueObligations ?? 0

    const maxFinancialValue =
        Math.max(
            income,
            expenses,
            1,
        )

    const incomeHeight =
        Math.max(
            (
                income /
                maxFinancialValue
            ) * 100,
            income > 0 ? 8 : 0,
        )

    const expenseHeight =
        Math.max(
            (
                expenses /
                maxFinancialValue
            ) * 100,
            expenses > 0 ? 8 : 0,
        )

    return (
        <section className="px-6 py-7 xl:px-8">

            {/* CABECERA */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

                <div>

                    <p className="text-sm font-semibold text-cyan-400">
                        Panel principal
                    </p>

                    <h2 className="mt-1 text-3xl font-black tracking-tight">
                        Dashboard
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                        {entity
                            ? `Resumen financiero de ${entity.displayName}.`
                            : 'Resumen de tu información contable.'}

                    </p>

                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">

                    <ShieldCheck size={17} />

                    Información actualizada

                </div>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* TARJETAS */}

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* INGRESOS */}

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-5">

                    <div className="flex items-start justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Ingresos
                            </p>

                            <p className="mt-3 text-2xl font-black">
                                {formatMoney(
                                    income,
                                )}
                            </p>

                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">

                            <TrendingUp size={21} />

                        </div>

                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                        Ingresos contabilizados
                    </p>

                </article>

                {/* GASTOS */}

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-5">

                    <div className="flex items-start justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Gastos
                            </p>

                            <p className="mt-3 text-2xl font-black">
                                {formatMoney(
                                    expenses,
                                )}
                            </p>

                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">

                            <TrendingDown size={21} />

                        </div>

                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                        Gastos contabilizados
                    </p>

                </article>

                {/* RESULTADO */}

                <article className="rounded-2xl border border-blue-400/20 bg-[#071329] p-5">

                    <div className="flex items-start justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Resultado
                            </p>

                            <p
                                className={`mt-3 text-2xl font-black ${
                                    netResult < 0
                                        ? 'text-rose-400'
                                        : 'text-white'
                                }`}
                            >
                                {formatMoney(
                                    netResult,
                                )}
                            </p>

                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                            <WalletCards size={21} />

                        </div>

                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                        Ingresos menos gastos
                    </p>

                </article>

                {/* POR COBRAR */}

                <article className="rounded-2xl border border-amber-400/20 bg-[#071329] p-5">

                    <div className="flex items-start justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Por cobrar
                            </p>

                            <p className="mt-3 text-2xl font-black">
                                {formatMoney(
                                    receivable,
                                )}
                            </p>

                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">

                            <CircleDollarSign
                                size={21}
                            />

                        </div>

                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                        Cuentas pendientes de cobro
                    </p>

                </article>

            </div>

            {/* GRÁFICO + OBLIGACIONES */}

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">

                {/* GRÁFICO */}

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                    <h3 className="font-bold">
                        Ingresos vs. gastos
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Comparación de los valores contabilizados
                    </p>

                    <div className="mt-8 grid h-[240px] grid-cols-2 items-end gap-12 px-8 sm:px-20">

                        {/* INGRESOS */}

                        <div className="flex h-full flex-col justify-end">

                            <div className="flex flex-1 items-end">

                                <div
                                    className="w-full rounded-t-xl bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-300 transition-all duration-500"
                                    style={{
                                        height:
                                            `${incomeHeight}%`,
                                    }}
                                />

                            </div>

                            <div className="mt-4 text-center">

                                <p className="text-sm font-semibold">
                                    Ingresos
                                </p>

                                <p className="mt-1 text-xs text-emerald-400">
                                    {formatMoney(
                                        income,
                                    )}
                                </p>

                            </div>

                        </div>

                        {/* GASTOS */}

                        <div className="flex h-full flex-col justify-end">

                            <div className="flex flex-1 items-end">

                                <div
                                    className="w-full rounded-t-xl bg-gradient-to-t from-rose-700 via-rose-500 to-rose-300 transition-all duration-500"
                                    style={{
                                        height:
                                            `${expenseHeight}%`,
                                    }}
                                />

                            </div>

                            <div className="mt-4 text-center">

                                <p className="text-sm font-semibold">
                                    Gastos
                                </p>

                                <p className="mt-1 text-xs text-rose-400">
                                    {formatMoney(
                                        expenses,
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                </article>

                {/* OBLIGACIONES */}

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                    <h3 className="font-bold">
                        Obligaciones
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Cuentas pendientes
                    </p>

                    <div className="mt-6 space-y-4">

                        {/* POR COBRAR */}

                        <div className="rounded-xl border border-slate-800 bg-[#0a1528] p-4">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-xs text-slate-500">
                                        Por cobrar
                                    </p>

                                    <p className="mt-1 text-lg font-bold">
                                        {formatMoney(
                                            receivable,
                                        )}
                                    </p>

                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">

                                    <TrendingUp size={18} />

                                </div>

                            </div>

                        </div>

                        {/* POR PAGAR */}

                        <div className="rounded-xl border border-slate-800 bg-[#0a1528] p-4">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-xs text-slate-500">
                                        Por pagar
                                    </p>

                                    <p className="mt-1 text-lg font-bold">
                                        {formatMoney(
                                            payable,
                                        )}
                                    </p>

                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">

                                    <TrendingDown size={18} />

                                </div>

                            </div>

                        </div>

                        {/* VENCIDAS */}

                        <div
                            className={`rounded-xl border p-4 ${
                                overdue > 0
                                    ? 'border-amber-400/20 bg-amber-500/10'
                                    : 'border-emerald-400/10 bg-emerald-500/5'
                            }`}
                        >

                            <p
                                className={`text-xs ${
                                    overdue > 0
                                        ? 'text-amber-300'
                                        : 'text-emerald-300'
                                }`}
                            >

                                {overdue > 0
                                    ? `${overdue} obligación(es) vencida(s).`
                                    : 'No existen obligaciones vencidas.'}

                            </p>

                        </div>

                    </div>

                </article>

            </div>

            {/* MOVIMIENTOS */}

            <article className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">

                <div className="border-b border-slate-800 px-6 py-5">

                    <h3 className="font-bold">
                        Movimientos recientes
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Últimas operaciones registradas
                    </p>

                </div>

                {movements.length === 0 ? (

                    <div className="flex min-h-[170px] items-center justify-center px-6 py-8">

                        <div className="text-center">

                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/60 text-slate-500">

                                <ReceiptText
                                    size={22}
                                />

                            </div>

                            <p className="mt-4 text-sm font-semibold text-slate-300">
                                No hay movimientos para mostrar
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                                Los ingresos y gastos aparecerán aquí.
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="divide-y divide-slate-800">

                        {movements.map(
                            (movement) => {
                                const isIncome =
                                    movement.type ===
                                    'INCOME'

                                return (
                                    <div
                                        key={
                                            movement.id
                                        }
                                        className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-800/20"
                                    >

                                        <div className="flex min-w-0 items-center gap-4">

                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                                    isIncome
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-rose-500/10 text-rose-400'
                                                }`}
                                            >

                                                {isIncome ? (
                                                    <TrendingUp
                                                        size={19}
                                                    />
                                                ) : (
                                                    <TrendingDown
                                                        size={19}
                                                    />
                                                )}

                                            </div>

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-semibold">
                                                    {
                                                        movement.description
                                                    }
                                                </p>

                                                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">

                          <span>
                            {formatDate(
                                movement.date,
                            )}
                          </span>

                                                    {movement.reference && (
                                                        <span>
                              {
                                  movement.reference
                              }
                            </span>
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                        <p
                                            className={`shrink-0 font-bold ${
                                                isIncome
                                                    ? 'text-emerald-400'
                                                    : 'text-rose-400'
                                            }`}
                                        >

                                            {isIncome
                                                ? '+'
                                                : '-'}

                                            {formatMoney(
                                                movement.amount,
                                            )}

                                        </p>

                                    </div>
                                )
                            },
                        )}

                    </div>

                )}

            </article>

        </section>
    )
}

export default DashboardPage