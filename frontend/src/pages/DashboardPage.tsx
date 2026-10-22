import {
    Bell,
    BookOpenText,
    Building2,
    ChevronDown,
    CircleDollarSign,
    FileBarChart,
    HandCoins,
    Home,
    LogOut,
    ReceiptText,
    Search,
    ShieldCheck,
    TrendingDown,
    TrendingUp,
    Users,
    WalletCards,
} from 'lucide-react'

import {
    useEffect,
    useState,
} from 'react'

import {
    useNavigate,
} from 'react-router-dom'

import {
    getCurrentUser,
    type CurrentUserResponse,
} from '../services/authService'

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

    const [user, setUser] =
        useState<CurrentUserResponse | null>(
            null,
        )

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

                /*
                 * 1. Usuario autenticado
                 */

                const currentUser =
                    await getCurrentUser()

                setUser(currentUser)

                /*
                 * 2. Entidades contables
                 */

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

                /*
                 * Primero buscamos una entidad activa.
                 * Si no existe, usamos la primera.
                 */

                const selectedEntity =
                    entities.find(
                        (item) => item.active,
                    ) ?? entities[0]

                setEntity(selectedEntity)

                /*
                 * 3. Dashboard real
                 */

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

    const handleLogout = () => {
        localStorage.removeItem(
            'accessToken',
        )

        navigate(
            '/login',
            {
                replace: true,
            },
        )
    }

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
            new Date(`${value}T00:00:00`)

        return new Intl.DateTimeFormat(
            'es-EC',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            },
        ).format(date)
    }

    /*
     * Cargando
     */

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#020817] text-white">

                <div className="text-center">

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-500/20 border-t-cyan-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando información contable...
                    </p>

                </div>

            </main>
        )
    }

    const primaryRole =
        user?.roles?.[0] ??
        'USUARIO'

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

    /*
     * Para el gráfico comparativo real.
     */

    const maxFinancialValue =
        Math.max(
            income,
            expenses,
            1,
        )

    const incomeHeight =
        Math.max(
            (income / maxFinancialValue) *
            100,
            income > 0 ? 8 : 0,
        )

    const expenseHeight =
        Math.max(
            (expenses /
                maxFinancialValue) *
            100,
            expenses > 0 ? 8 : 0,
        )

    return (
        <main className="min-h-screen bg-[#020817] text-white">

            <div className="flex min-h-screen">

                {/* =====================================
            SIDEBAR
        ====================================== */}

                <aside className="hidden w-[260px] flex-col border-r border-slate-800/80 bg-[#050d1c] lg:flex">

                    {/* Logo */}

                    <div className="flex h-[78px] items-center gap-3 border-b border-slate-800/80 px-6">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-lg font-black shadow-lg shadow-blue-600/20">
                            C
                        </div>

                        <div>

                            <h1 className="font-bold">
                                ContaCore
                            </h1>

                            <p className="text-[11px] text-slate-500">
                                Gestión contable
                            </p>

                        </div>

                    </div>

                    {/* Entidad */}

                    {entity && (
                        <div className="mx-4 mt-4 rounded-xl border border-blue-400/10 bg-blue-500/5 px-4 py-3">

                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                Entidad actual
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-slate-300">
                                {entity.displayName}
                            </p>

                        </div>
                    )}

                    {/* Navegación */}

                    <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">

                        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                            Principal
                        </p>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20"
                        >
                            <Home size={18} />

                            Dashboard
                        </button>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                        >
                            <HandCoins size={18} />

                            Ingresos
                        </button>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                        >
                            <ReceiptText size={18} />

                            Gastos
                        </button>

                        <p className="mb-3 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                            Gestión
                        </p>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                        >
                            <Users size={18} />

                            Clientes
                        </button>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                        >
                            <Building2 size={18} />

                            Proveedores
                        </button>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                        >
                            <WalletCards size={18} />

                            Cuentas por cobrar
                        </button>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                        >
                            <CircleDollarSign size={18} />

                            Cuentas por pagar
                        </button>

                        <p className="mb-3 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                            Contabilidad
                        </p>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                        >
                            <BookOpenText size={18} />

                            Asientos contables
                        </button>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                        >
                            <FileBarChart size={18} />

                            Reportes
                        </button>

                    </nav>

                    {/* Logout */}

                    <div className="border-t border-slate-800/80 p-4">

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                        >
                            <LogOut size={18} />

                            Cerrar sesión
                        </button>

                    </div>

                </aside>

                {/* =====================================
            CONTENIDO
        ====================================== */}

                <div className="flex min-w-0 flex-1 flex-col">

                    {/* Header */}

                    <header className="flex h-[78px] items-center justify-between border-b border-slate-800/80 bg-[#061126]/80 px-6 backdrop-blur-xl xl:px-8">

                        <div className="relative hidden md:block">

                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                type="text"
                                placeholder="Buscar en ContaCore..."
                                className="w-[300px] rounded-xl border border-slate-800 bg-[#0a1528] py-2.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                            />

                        </div>

                        <div className="ml-auto flex items-center gap-4">

                            <button
                                type="button"
                                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-[#0a1528] text-slate-400 transition hover:text-white"
                            >
                                <Bell size={18} />
                            </button>

                            <div className="h-8 w-px bg-slate-800" />

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-600/20">

                                    {user?.email
                                        ?.charAt(0)
                                        .toUpperCase()}

                                </div>

                                <div className="hidden sm:block">

                                    <p className="max-w-[180px] truncate text-sm font-semibold">
                                        {user?.email}
                                    </p>

                                    <p className="text-xs text-blue-400">
                                        {primaryRole}
                                    </p>

                                </div>

                                <ChevronDown
                                    size={16}
                                    className="hidden text-slate-500 sm:block"
                                />

                            </div>

                        </div>

                    </header>

                    {/* Dashboard */}

                    <section className="flex-1 overflow-y-auto px-6 py-7 xl:px-8">

                        {/* Cabecera */}

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

                        {/* Error */}

                        {error && (
                            <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                                {error}
                            </div>
                        )}

                        {/* =====================================
                TARJETAS REALES
            ====================================== */}

                        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            {/* Ingresos */}

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

                                        <TrendingUp
                                            size={21}
                                        />

                                    </div>

                                </div>

                                <p className="mt-4 text-xs text-slate-500">
                                    Ingresos contabilizados
                                </p>

                            </article>

                            {/* Gastos */}

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

                                        <TrendingDown
                                            size={21}
                                        />

                                    </div>

                                </div>

                                <p className="mt-4 text-xs text-slate-500">
                                    Gastos contabilizados
                                </p>

                            </article>

                            {/* Resultado */}

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

                                        <WalletCards
                                            size={21}
                                        />

                                    </div>

                                </div>

                                <p className="mt-4 text-xs text-slate-500">
                                    Ingresos menos gastos
                                </p>

                            </article>

                            {/* Cobrar */}

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

                        {/* =====================================
                SEGUNDA FILA
            ====================================== */}

                        <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">

                            {/* Comparativo */}

                            <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                                <div>

                                    <h3 className="font-bold">
                                        Ingresos vs. gastos
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Comparación de los valores contabilizados
                                    </p>

                                </div>

                                <div className="mt-8 grid h-[240px] grid-cols-2 items-end gap-12 px-8 sm:px-20">

                                    {/* Ingresos */}

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

                                    {/* Gastos */}

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

                            {/* Obligaciones */}

                            <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                                <h3 className="font-bold">
                                    Obligaciones
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Cuentas pendientes
                                </p>

                                <div className="mt-6 space-y-4">

                                    {/* Cobrar */}

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

                                                <TrendingUp
                                                    size={18}
                                                />

                                            </div>

                                        </div>

                                    </div>

                                    {/* Pagar */}

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

                                                <TrendingDown
                                                    size={18}
                                                />

                                            </div>

                                        </div>

                                    </div>

                                    {/* Vencidas */}

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

                        {/* =====================================
                MOVIMIENTOS REALES
            ====================================== */}

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
                                                                {movement.description}
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

                </div>

            </div>

        </main>
    )
}

export default DashboardPage