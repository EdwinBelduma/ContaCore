import {
    Ban,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    FileText,
    LoaderCircle,
    Plus,
    Search,
    TrendingDown,
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
    getExpenses,
    postExpense,
    voidExpense,
    type Expense,
    type ExpenseStatus,
} from '../services/expenseService'

function ExpensesPage() {
    const navigate = useNavigate()

    const [entity, setEntity] =
        useState<AccountingEntity | null>(
            null,
        )

    const [expenses, setExpenses] =
        useState<Expense[]>([])

    const [totalExpenses, setTotalExpenses] =
        useState(0)

    const [search, setSearch] =
        useState('')

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [success, setSuccess] =
        useState('')

    const [
        postingExpenseId,
        setPostingExpenseId,
    ] = useState<string | null>(
        null,
    )

    const [
        voidingExpenseId,
        setVoidingExpenseId,
    ] = useState<string | null>(
        null,
    )

    useEffect(() => {
        const loadExpenses = async () => {
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

                const [
                    expenseList,
                    summary,
                ] = await Promise.all([
                    getExpenses(
                        selectedEntity.id,
                    ),

                    getDashboardSummary(
                        selectedEntity.id,
                    ),
                ])

                setExpenses(
                    expenseList ?? [],
                )

                setTotalExpenses(
                    summary.totalExpenses ?? 0,
                )
            } catch (exception) {
                console.error(
                    'Error cargando gastos:',
                    exception,
                )

                setError(
                    'No fue posible cargar los gastos.',
                )
            } finally {
                setLoading(false)
            }
        }

        loadExpenses()
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
        status: ExpenseStatus,
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
        status: ExpenseStatus,
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

    const filteredExpenses =
        useMemo(() => {
            const term =
                search
                    .trim()
                    .toLowerCase()

            if (!term) {
                return expenses
            }

            return expenses.filter(
                (expense) => {
                    const description =
                        expense.description
                            ?.toLowerCase() ?? ''

                    const reference =
                        expense.reference
                            ?.toLowerCase() ?? ''

                    const status =
                        getStatusLabel(
                            expense.status,
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
        }, [expenses, search])

    const postedCount =
        expenses.filter(
            (expense) =>
                expense.status ===
                'POSTED',
        ).length

    /*
     * CONTABILIZAR GASTO
     */

    const handlePostExpense = async (
        expense: Expense,
    ) => {
        if (!entity) {
            return
        }

        const confirmed =
            window.confirm(
                `¿Deseas contabilizar el gasto "${expense.description}" por ${formatMoney(
                    expense.amount,
                )}?`,
            )

        if (!confirmed) {
            return
        }

        try {
            setPostingExpenseId(
                expense.id,
            )

            setError('')
            setSuccess('')

            const updatedExpense =
                await postExpense(
                    entity.id,
                    expense.id,
                )

            setExpenses(
                (current) =>
                    current.map(
                        (item) =>
                            item.id ===
                            updatedExpense.id
                                ? updatedExpense
                                : item,
                    ),
            )

            const summary =
                await getDashboardSummary(
                    entity.id,
                )

            setTotalExpenses(
                summary.totalExpenses ?? 0,
            )

            setSuccess(
                'Gasto contabilizado correctamente.',
            )
        } catch (exception) {
            console.error(
                'Error contabilizando gasto:',
                exception,
            )

            setError(
                'No fue posible contabilizar el gasto.',
            )
        } finally {
            setPostingExpenseId(
                null,
            )
        }
    }

    /*
     * ANULAR GASTO
     */

    const handleVoidExpense = async (
        expense: Expense,
    ) => {
        if (!entity) {
            return
        }

        const confirmed =
            window.confirm(
                `¿Deseas anular el gasto "${expense.description}" por ${formatMoney(
                    expense.amount,
                )}?\n\nEsta acción anulará también su asiento contable.`,
            )

        if (!confirmed) {
            return
        }

        try {
            setVoidingExpenseId(
                expense.id,
            )

            setError('')
            setSuccess('')

            const updatedExpense =
                await voidExpense(
                    entity.id,
                    expense.id,
                )

            setExpenses(
                (current) =>
                    current.map(
                        (item) =>
                            item.id ===
                            updatedExpense.id
                                ? updatedExpense
                                : item,
                    ),
            )

            const summary =
                await getDashboardSummary(
                    entity.id,
                )

            setTotalExpenses(
                summary.totalExpenses ?? 0,
            )

            setSuccess(
                'Gasto anulado correctamente.',
            )
        } catch (exception) {
            console.error(
                'Error anulando gasto:',
                exception,
            )

            setError(
                'No fue posible anular el gasto.',
            )
        } finally {
            setVoidingExpenseId(
                null,
            )
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-rose-500/20 border-t-rose-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando gastos...
                    </p>

                </div>

            </div>
        )
    }

    return (
        <section className="px-6 py-7 xl:px-8">

            {/* CABECERA */}

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div>

                    <p className="text-sm font-semibold text-rose-400">
                        Gestión financiera
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Gastos
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                        {entity
                            ? `Gastos registrados en ${entity.displayName}.`
                            : 'Administra tus gastos.'}

                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/gastos/nuevo',
                        )
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/10 transition hover:bg-rose-400"
                >
                    <Plus size={18} />

                    Nuevo gasto
                </button>

            </div>

            {/* MENSAJES */}

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">

                    <CheckCircle2
                        size={18}
                    />

                    {success}

                </div>
            )}

            {/* TARJETAS */}

            <div className="mt-8 grid gap-4 md:grid-cols-3">

                {/* TOTAL */}

                <article className="rounded-2xl border border-rose-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Total contabilizado
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {formatMoney(
                                    totalExpenses,
                                )}
                            </p>

                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">

                            <TrendingDown
                                size={23}
                            />

                        </div>

                    </div>

                </article>

                {/* REGISTROS */}

                <article className="rounded-2xl border border-blue-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Registros
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {expenses.length}
                            </p>

                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                            <CircleDollarSign
                                size={23}
                            />

                        </div>

                    </div>

                </article>

                {/* CONTABILIZADOS */}

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

            {/* TABLA */}

            <article className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">

                <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 md:flex-row md:items-center md:justify-between">

                    <div>

                        <h3 className="font-bold">
                            Gastos registrados
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Historial de gastos de la entidad contable.
                        </p>

                    </div>

                    {/* BUSCADOR */}

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
                            placeholder="Buscar gasto..."
                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-2.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-rose-500/40 md:w-[280px]"
                        />

                    </div>

                </div>

                {/* SIN GASTOS */}

                {filteredExpenses.length === 0 ? (

                    <div className="flex min-h-[270px] items-center justify-center px-6">

                        <div className="text-center">

                            <TrendingDown
                                size={28}
                                className="mx-auto text-rose-400"
                            />

                            <p className="mt-4 font-semibold">
                                No hay gastos para mostrar
                            </p>

                            <p className="mt-2 text-sm text-slate-500">

                                {search
                                    ? 'No encontramos gastos que coincidan con tu búsqueda.'
                                    : 'Cuando registres gastos aparecerán aquí.'}

                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px]">

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

                                <th className="px-6 py-4 text-right">
                                    Acciones
                                </th>

                            </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-800">

                            {filteredExpenses.map(
                                (expense) => {
                                    const isPosting =
                                        postingExpenseId ===
                                        expense.id

                                    const isVoiding =
                                        voidingExpenseId ===
                                        expense.id

                                    return (
                                        <tr
                                            key={expense.id}
                                            className="transition hover:bg-slate-800/20"
                                        >

                                            {/* FECHA */}

                                            <td className="whitespace-nowrap px-6 py-4">

                                                <div className="flex items-center gap-2 text-sm text-slate-300">

                                                    <CalendarDays
                                                        size={15}
                                                        className="text-slate-500"
                                                    />

                                                    {formatDate(
                                                        expense.expenseDate,
                                                    )}

                                                </div>

                                            </td>

                                            {/* DESCRIPCIÓN */}

                                            <td className="px-6 py-4">

                                                <p className="max-w-[350px] truncate text-sm font-semibold text-slate-200">
                                                    {expense.description}
                                                </p>

                                            </td>

                                            {/* REFERENCIA */}

                                            <td className="px-6 py-4 text-sm text-slate-400">

                                                {expense.reference ||
                                                    'Sin referencia'}

                                            </td>

                                            {/* ESTADO */}

                                            <td className="px-6 py-4">

                          <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                  expense.status,
                              )}`}
                          >
                            {getStatusLabel(
                                expense.status,
                            )}
                          </span>

                                            </td>

                                            {/* MONTO */}

                                            <td className="whitespace-nowrap px-6 py-4 text-right">

                          <span className="font-bold text-rose-400">

                            {formatMoney(
                                expense.amount,
                            )}

                          </span>

                                            </td>

                                            {/* ACCIONES */}

                                            <td className="whitespace-nowrap px-6 py-4 text-right">

                                                {/* BORRADOR */}

                                                {expense.status ===
                                                    'DRAFT' && (

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isPosting
                                                            }
                                                            onClick={() =>
                                                                handlePostExpense(
                                                                    expense,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >

                                                            {isPosting ? (
                                                                <LoaderCircle
                                                                    size={15}
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <CheckCircle2
                                                                    size={15}
                                                                />
                                                            )}

                                                            {isPosting
                                                                ? 'Contabilizando...'
                                                                : 'Contabilizar'}

                                                        </button>

                                                    )}

                                                {/* CONTABILIZADO */}

                                                {expense.status ===
                                                    'POSTED' && (

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isVoiding
                                                            }
                                                            onClick={() =>
                                                                handleVoidExpense(
                                                                    expense,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >

                                                            {isVoiding ? (
                                                                <LoaderCircle
                                                                    size={15}
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Ban
                                                                    size={15}
                                                                />
                                                            )}

                                                            {isVoiding
                                                                ? 'Anulando...'
                                                                : 'Anular'}

                                                        </button>

                                                    )}

                                                {/* ANULADO */}

                                                {expense.status ===
                                                    'VOIDED' && (

                                                        <span className="text-xs text-slate-600">
                              —
                            </span>

                                                    )}

                                            </td>

                                        </tr>
                                    )
                                },
                            )}

                            </tbody>

                        </table>

                    </div>

                )}

            </article>

        </section>
    )
}

export default ExpensesPage