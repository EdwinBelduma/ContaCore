import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    CircleAlert,
    CircleDollarSign,
    FileBarChart,
    Gauge,
    Landmark,
    ReceiptText,
    ShieldCheck,
    Sparkles,
    TrendingDown,
    TrendingUp,
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
    getDashboardSummary,
    getRecentMovements,
    type DashboardMovement,
    type DashboardSummary,
} from '../services/dashboardService'

function DashboardPage() {
    const navigate = useNavigate()

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
                        (item) =>
                            item.active,
                    ) ??
                    entities[0]

                setEntity(
                    selectedEntity,
                )

                const [
                    dashboardSummary,
                    recentMovements,
                ] =
                    await Promise.all([
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
                    recentMovements ??
                    [],
                )
            } catch (
                exception
                ) {
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
    ) =>
        new Intl.NumberFormat(
            'es-EC',
            {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
            },
        ).format(
            Number(value ?? 0),
        )

    const formatNumber = (
        value?: number | null,
    ) =>
        new Intl.NumberFormat(
            'es-EC',
            {
                maximumFractionDigits: 1,
            },
        ).format(
            Number(value ?? 0),
        )

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

    const financialMetrics =
        useMemo(
            () => {
                const maxValue =
                    Math.max(
                        income,
                        expenses,
                        1,
                    )

                const incomeHeight =
                    income > 0
                        ? Math.max(
                            (
                                income /
                                maxValue
                            ) *
                            100,
                            8,
                        )
                        : 0

                const expenseHeight =
                    expenses > 0
                        ? Math.max(
                            (
                                expenses /
                                maxValue
                            ) *
                            100,
                            8,
                        )
                        : 0

                const netMargin =
                    income > 0
                        ? (
                            netResult /
                            income
                        ) *
                        100
                        : 0

                const expenseRatio =
                    income > 0
                        ? (
                            expenses /
                            income
                        ) *
                        100
                        : expenses > 0
                            ? 100
                            : 0

                const coverage =
                    payable > 0
                        ? (
                            receivable /
                            payable
                        ) *
                        100
                        : receivable > 0
                            ? 100
                            : 0

                const obligationsBalance =
                    receivable -
                    payable

                return {
                    incomeHeight,
                    expenseHeight,
                    netMargin,
                    expenseRatio,
                    coverage,
                    obligationsBalance,
                }
            },
            [
                income,
                expenses,
                netResult,
                receivable,
                payable,
            ],
        )

    const recentMovements =
        movements.slice(
            0,
            6,
        )

    const financialStatus =
        overdue > 0
            ? {
                label:
                    'Atención requerida',
                detail:
                    `${overdue} obligación(es) vencida(s) requieren revisión.`,
                className:
                    'border-amber-400/20 bg-amber-500/10 text-amber-300',
                iconClassName:
                    'bg-amber-500/10 text-amber-300',
            }
            : netResult < 0
                ? {
                    label:
                        'Resultado negativo',
                    detail:
                        'Los gastos superan a los ingresos contabilizados.',
                    className:
                        'border-rose-400/20 bg-rose-500/10 text-rose-300',
                    iconClassName:
                        'bg-rose-500/10 text-rose-300',
                }
                : {
                    label:
                        'Finanzas estables',
                    detail:
                        'No existen obligaciones vencidas y el resultado es favorable.',
                    className:
                        'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
                    iconClassName:
                        'bg-emerald-500/10 text-emerald-300',
                }

    if (loading) {
        return (
            <div className="flex min-h-[560px] items-center justify-center px-6">
                <div className="text-center">
                    <div className="relative mx-auto h-14 w-14">
                        <div className="absolute inset-0 rounded-full border border-cyan-400/20 bg-cyan-500/5" />

                        <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-blue-500" />
                    </div>

                    <p className="mt-5 text-sm font-medium text-slate-300">
                        Preparando tu resumen financiero
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                        Cargando indicadores y movimientos...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <section className="relative overflow-hidden px-5 py-6 sm:px-6 xl:px-8 xl:py-8">
            {/* FONDO DECORATIVO */}

            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/[0.05] blur-3xl" />
            <div className="pointer-events-none absolute left-1/3 top-44 h-64 w-64 rounded-full bg-cyan-400/[0.03] blur-3xl" />

            <div className="relative">
                {/* =====================================================
                    CABECERA
                ====================================================== */}

                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-500/[0.06] px-3 py-1 text-xs font-bold text-cyan-300">
                                <Sparkles
                                    size={13}
                                />

                                Centro financiero
                            </span>

                            {entity?.active && (
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/[0.06] px-3 py-1 text-xs font-semibold text-emerald-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                    Entidad activa
                                </span>
                            )}
                        </div>

                        <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
                            Dashboard financiero
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            {entity
                                ? `Vista consolidada de ${entity.displayName}: rendimiento, obligaciones y actividad contable reciente.`
                                : 'Vista consolidada de tu información financiera y contable.'}
                        </p>
                    </div>

                    {/* ACCIONES RÁPIDAS */}

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/ingresos/nuevo',
                                )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-2.5 text-sm font-bold text-emerald-300 transition hover:-translate-y-0.5 hover:bg-emerald-500/[0.14]"
                        >
                            <ArrowUpRight
                                size={17}
                            />

                            Nuevo ingreso
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/gastos/nuevo',
                                )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/[0.08] px-4 py-2.5 text-sm font-bold text-rose-300 transition hover:-translate-y-0.5 hover:bg-rose-500/[0.14]"
                        >
                            <ArrowDownRight
                                size={17}
                            />

                            Nuevo gasto
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/reportes',
                                )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/[0.08] px-4 py-2.5 text-sm font-bold text-blue-300 transition hover:-translate-y-0.5 hover:bg-blue-500/[0.14]"
                        >
                            <FileBarChart
                                size={17}
                            />

                            Reportes
                        </button>
                    </div>
                </div>

                {/* ERROR */}

                {error && (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
                        <CircleAlert
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <div>
                            <p className="font-bold">
                                No pudimos cargar todo el Dashboard
                            </p>

                            <p className="mt-1 text-rose-300/80">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* =====================================================
                    KPI PRINCIPALES
                ====================================================== */}

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* INGRESOS */}

                    <article className="group relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-[#071329] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/30">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/[0.08] blur-2xl" />

                        <div className="relative">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Ingresos
                                    </p>

                                    <p className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                        {formatMoney(
                                            income,
                                        )}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-500/10 text-emerald-300">
                                    <TrendingUp
                                        size={21}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between text-xs">
                                <span className="text-slate-500">
                                    Total contabilizado
                                </span>

                                <span className="font-bold text-emerald-300">
                                    Entrada
                                </span>
                            </div>
                        </div>
                    </article>

                    {/* GASTOS */}

                    <article className="group relative overflow-hidden rounded-2xl border border-rose-400/15 bg-[#071329] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-rose-400/30">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-500/[0.08] blur-2xl" />

                        <div className="relative">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Gastos
                                    </p>

                                    <p className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                        {formatMoney(
                                            expenses,
                                        )}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-400/10 bg-rose-500/10 text-rose-300">
                                    <TrendingDown
                                        size={21}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between text-xs">
                                <span className="text-slate-500">
                                    Total contabilizado
                                </span>

                                <span className="font-bold text-rose-300">
                                    Salida
                                </span>
                            </div>
                        </div>
                    </article>

                    {/* RESULTADO */}

                    <article
                        className={`group relative overflow-hidden rounded-2xl border bg-[#071329] p-5 transition duration-300 hover:-translate-y-0.5 ${
                            netResult >= 0
                                ? 'border-blue-400/15 hover:border-blue-400/30'
                                : 'border-rose-400/20 hover:border-rose-400/35'
                        }`}
                    >
                        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/[0.08] blur-2xl" />

                        <div className="relative">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Resultado neto
                                    </p>

                                    <p
                                        className={`mt-3 text-2xl font-black tracking-tight sm:text-3xl ${
                                            netResult >= 0
                                                ? 'text-white'
                                                : 'text-rose-300'
                                        }`}
                                    >
                                        {formatMoney(
                                            netResult,
                                        )}
                                    </p>
                                </div>

                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                                        netResult >= 0
                                            ? 'border-blue-400/10 bg-blue-500/10 text-blue-300'
                                            : 'border-rose-400/10 bg-rose-500/10 text-rose-300'
                                    }`}
                                >
                                    <WalletCards
                                        size={21}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between text-xs">
                                <span className="text-slate-500">
                                    Margen sobre ingresos
                                </span>

                                <span
                                    className={`font-black ${
                                        netResult >= 0
                                            ? 'text-blue-300'
                                            : 'text-rose-300'
                                    }`}
                                >
                                    {formatNumber(
                                        financialMetrics.netMargin,
                                    )}
                                    %
                                </span>
                            </div>
                        </div>
                    </article>

                    {/* CUENTAS POR COBRAR */}

                    <article className="group relative overflow-hidden rounded-2xl border border-amber-400/15 bg-[#071329] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-amber-400/30">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-500/[0.08] blur-2xl" />

                        <div className="relative">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Por cobrar
                                    </p>

                                    <p className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                        {formatMoney(
                                            receivable,
                                        )}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/10 bg-amber-500/10 text-amber-300">
                                    <CircleDollarSign
                                        size={21}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between text-xs">
                                <span className="text-slate-500">
                                    Pendiente de cobro
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            '/cuentas-por-cobrar',
                                        )
                                    }
                                    className="inline-flex items-center gap-1 font-bold text-amber-300 transition hover:text-amber-200"
                                >
                                    Ver detalle

                                    <ArrowRight
                                        size={13}
                                    />
                                </button>
                            </div>
                        </div>
                    </article>
                </div>

                {/* =====================================================
                    SALUD FINANCIERA + MÉTRICAS OPERATIVAS
                ====================================================== */}

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr]">
                    {/* ESTADO */}

                    <article className="rounded-2xl border border-slate-800 bg-[#071329] p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                    Estado financiero
                                </p>

                                <div className="mt-3 flex items-center gap-3">
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${financialStatus.iconClassName}`}
                                    >
                                        {overdue > 0 ? (
                                            <CircleAlert
                                                size={21}
                                            />
                                        ) : (
                                            <ShieldCheck
                                                size={21}
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-black text-white">
                                            {
                                                financialStatus.label
                                            }
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            {
                                                financialStatus.detail
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <span
                                className={`rounded-full border px-3 py-1 text-[11px] font-bold ${financialStatus.className}`}
                            >
                                Actual
                            </span>
                        </div>
                    </article>

                    {/* COBERTURA */}

                    <article className="rounded-2xl border border-slate-800 bg-[#071329] p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                    Cobertura
                                </p>

                                <p className="mt-3 text-2xl font-black text-white">
                                    {formatNumber(
                                        financialMetrics.coverage,
                                    )}
                                    %
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                                <Gauge
                                    size={20}
                                />
                            </div>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-slate-500">
                            Relación entre cuentas por cobrar y cuentas por pagar.
                        </p>
                    </article>

                    {/* BALANCE OBLIGACIONES */}

                    <article className="rounded-2xl border border-slate-800 bg-[#071329] p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                    Balance de obligaciones
                                </p>

                                <p
                                    className={`mt-3 text-2xl font-black ${
                                        financialMetrics.obligationsBalance >=
                                        0
                                            ? 'text-emerald-300'
                                            : 'text-rose-300'
                                    }`}
                                >
                                    {formatMoney(
                                        financialMetrics.obligationsBalance,
                                    )}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                                <Landmark
                                    size={20}
                                />
                            </div>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-slate-500">
                            Diferencia entre lo pendiente por cobrar y lo pendiente por pagar.
                        </p>
                    </article>
                </div>

                {/* =====================================================
                    RENDIMIENTO + OBLIGACIONES
                ====================================================== */}

                <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
                    {/* RENDIMIENTO */}

                    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">
                        <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <BarChart3
                                        size={19}
                                        className="text-cyan-300"
                                    />

                                    <h3 className="font-bold text-white">
                                        Rendimiento financiero
                                    </h3>
                                </div>

                                <p className="mt-1 text-xs text-slate-500">
                                    Comparación entre ingresos y gastos contabilizados.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-[#0a1528] px-3 py-2 text-right">
                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                    Gasto / ingreso
                                </p>

                                <p className="mt-0.5 text-sm font-black text-white">
                                    {formatNumber(
                                        financialMetrics.expenseRatio,
                                    )}
                                    %
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* BARRAS VERTICALES */}

                            <div className="grid h-[270px] grid-cols-2 items-end gap-8 rounded-2xl border border-slate-800/80 bg-[#061022] px-8 pb-5 pt-7 sm:gap-16 sm:px-16 lg:px-24">
                                <div className="flex h-full flex-col justify-end">
                                    <div className="flex flex-1 items-end">
                                        <div
                                            className="relative w-full overflow-hidden rounded-t-xl border border-emerald-400/10 bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-300 shadow-[0_-10px_35px_rgba(16,185,129,0.12)] transition-all duration-500"
                                            style={{
                                                height: `${financialMetrics.incomeHeight}%`,
                                            }}
                                        >
                                            <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                                        </div>
                                    </div>

                                    <div className="mt-4 text-center">
                                        <p className="text-sm font-bold text-white">
                                            Ingresos
                                        </p>

                                        <p className="mt-1 text-xs font-semibold text-emerald-300">
                                            {formatMoney(
                                                income,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex h-full flex-col justify-end">
                                    <div className="flex flex-1 items-end">
                                        <div
                                            className="relative w-full overflow-hidden rounded-t-xl border border-rose-400/10 bg-gradient-to-t from-rose-700 via-rose-500 to-rose-300 shadow-[0_-10px_35px_rgba(244,63,94,0.10)] transition-all duration-500"
                                            style={{
                                                height: `${financialMetrics.expenseHeight}%`,
                                            }}
                                        >
                                            <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                                        </div>
                                    </div>

                                    <div className="mt-4 text-center">
                                        <p className="text-sm font-bold text-white">
                                            Gastos
                                        </p>

                                        <p className="mt-1 text-xs font-semibold text-rose-300">
                                            {formatMoney(
                                                expenses,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* RESUMEN */}

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-800 bg-[#0a1528] p-4">
                                    <p className="text-xs text-slate-500">
                                        Resultado
                                    </p>

                                    <p
                                        className={`mt-2 font-black ${
                                            netResult >= 0
                                                ? 'text-emerald-300'
                                                : 'text-rose-300'
                                        }`}
                                    >
                                        {formatMoney(
                                            netResult,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-[#0a1528] p-4">
                                    <p className="text-xs text-slate-500">
                                        Margen
                                    </p>

                                    <p
                                        className={`mt-2 font-black ${
                                            financialMetrics.netMargin >=
                                            0
                                                ? 'text-blue-300'
                                                : 'text-rose-300'
                                        }`}
                                    >
                                        {formatNumber(
                                            financialMetrics.netMargin,
                                        )}
                                        %
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-[#0a1528] p-4">
                                    <p className="text-xs text-slate-500">
                                        Vencidas
                                    </p>

                                    <p
                                        className={`mt-2 font-black ${
                                            overdue > 0
                                                ? 'text-amber-300'
                                                : 'text-emerald-300'
                                        }`}
                                    >
                                        {overdue}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* OBLIGACIONES */}

                    <article className="rounded-2xl border border-slate-800 bg-[#071329]">
                        <div className="border-b border-slate-800 px-6 py-5">
                            <div className="flex items-center gap-2">
                                <CircleDollarSign
                                    size={19}
                                    className="text-amber-300"
                                />

                                <h3 className="font-bold text-white">
                                    Obligaciones
                                </h3>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                                Estado de saldos pendientes.
                            </p>
                        </div>

                        <div className="space-y-4 p-6">
                            {/* POR COBRAR */}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        '/cuentas-por-cobrar',
                                    )
                                }
                                className="group w-full rounded-xl border border-slate-800 bg-[#0a1528] p-4 text-left transition hover:border-emerald-400/20 hover:bg-emerald-500/[0.04]"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Cuentas por cobrar
                                        </p>

                                        <p className="mt-1 text-lg font-black text-white">
                                            {formatMoney(
                                                receivable,
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 transition group-hover:scale-105">
                                        <TrendingUp
                                            size={18}
                                        />
                                    </div>
                                </div>
                            </button>

                            {/* POR PAGAR */}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        '/cuentas-por-pagar',
                                    )
                                }
                                className="group w-full rounded-xl border border-slate-800 bg-[#0a1528] p-4 text-left transition hover:border-rose-400/20 hover:bg-rose-500/[0.04]"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Cuentas por pagar
                                        </p>

                                        <p className="mt-1 text-lg font-black text-white">
                                            {formatMoney(
                                                payable,
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300 transition group-hover:scale-105">
                                        <TrendingDown
                                            size={18}
                                        />
                                    </div>
                                </div>
                            </button>

                            {/* VENCIDAS */}

                            <div
                                className={`rounded-xl border p-4 ${
                                    overdue > 0
                                        ? 'border-amber-400/20 bg-amber-500/[0.07]'
                                        : 'border-emerald-400/15 bg-emerald-500/[0.05]'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                            overdue > 0
                                                ? 'bg-amber-500/10 text-amber-300'
                                                : 'bg-emerald-500/10 text-emerald-300'
                                        }`}
                                    >
                                        {overdue > 0 ? (
                                            <CircleAlert
                                                size={17}
                                            />
                                        ) : (
                                            <ShieldCheck
                                                size={17}
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <p
                                            className={`text-sm font-bold ${
                                                overdue > 0
                                                    ? 'text-amber-200'
                                                    : 'text-emerald-200'
                                            }`}
                                        >
                                            {overdue > 0
                                                ? `${overdue} obligación(es) vencida(s)`
                                                : 'Sin obligaciones vencidas'}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            {overdue > 0
                                                ? 'Revisa los vencimientos para mantener el control de tu flujo financiero.'
                                                : 'No existen saldos vencidos que requieran atención.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>

                {/* =====================================================
                    MOVIMIENTOS RECIENTES
                ====================================================== */}

                <article className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">
                    <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <ReceiptText
                                    size={19}
                                    className="text-blue-300"
                                />

                                <h3 className="font-bold text-white">
                                    Movimientos recientes
                                </h3>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                                Últimas operaciones contabilizadas en la entidad.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/asientos',
                                )
                            }
                            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-800 bg-[#0a1528] px-3.5 py-2 text-xs font-bold text-slate-300 transition hover:border-blue-400/20 hover:text-blue-300 sm:self-auto"
                        >
                            Ver todos

                            <ArrowRight
                                size={14}
                            />
                        </button>
                    </div>

                    {recentMovements.length ===
                    0 ? (
                        <div className="flex min-h-[210px] items-center justify-center px-6 py-10">
                            <div className="max-w-sm text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-500">
                                    <ReceiptText
                                        size={24}
                                    />
                                </div>

                                <p className="mt-4 font-bold text-slate-300">
                                    Aún no hay movimientos
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Cuando contabilices ingresos, gastos u otras operaciones aparecerán en este resumen.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {recentMovements.map(
                                (
                                    movement,
                                ) => {
                                    const isIncome =
                                        movement.type ===
                                        'INCOME'

                                    return (
                                        <div
                                            key={
                                                movement.id
                                            }
                                            className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-800/20 sm:px-6"
                                        >
                                            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                                                        isIncome
                                                            ? 'border-emerald-400/10 bg-emerald-500/10 text-emerald-300'
                                                            : 'border-rose-400/10 bg-rose-500/10 text-rose-300'
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
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <p className="truncate text-sm font-bold text-slate-200">
                                                            {
                                                                movement.description
                                                            }
                                                        </p>

                                                        <span
                                                            className={`hidden rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline-flex ${
                                                                isIncome
                                                                    ? 'bg-emerald-500/10 text-emerald-300'
                                                                    : 'bg-rose-500/10 text-rose-300'
                                                            }`}
                                                        >
                                                            {isIncome
                                                                ? 'Ingreso'
                                                                : 'Gasto'}
                                                        </span>
                                                    </div>

                                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                                        <span>
                                                            {formatDate(
                                                                movement.date,
                                                            )}
                                                        </span>

                                                        {movement.reference && (
                                                            <>
                                                                <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />

                                                                <span className="truncate">
                                                                    {
                                                                        movement.reference
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p
                                                    className={`font-black ${
                                                        isIncome
                                                            ? 'text-emerald-300'
                                                            : 'text-rose-300'
                                                    }`}
                                                >
                                                    {isIncome
                                                        ? '+'
                                                        : '-'}

                                                    {formatMoney(
                                                        movement.amount,
                                                    )}
                                                </p>

                                                <p className="mt-1 hidden text-[10px] uppercase tracking-wider text-slate-600 sm:block">
                                                    Contabilizado
                                                </p>
                                            </div>
                                        </div>
                                    )
                                },
                            )}
                        </div>
                    )}
                </article>
            </div>
        </section>
    )
}

export default DashboardPage
