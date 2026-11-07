import {
    ArrowLeft,
    CircleDollarSign,
    Clock3,
    LoaderCircle,
    ReceiptText,
    UserRound,
    WalletCards,
} from 'lucide-react'

import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react'

import {
    useNavigate,
    useParams,
} from 'react-router-dom'

import {
    getAccountingEntities,
    type AccountingEntity,
} from '../services/accountingEntityService'

import {
    getAccounts,
    type Account,
} from '../services/accountService'

import {
    getCustomerById,
    type Customer,
} from '../services/customerService'

import {
    getObligationById,
    getObligationPayments,
    registerObligationPayment,
    type Obligation,
    type ObligationPayment,
} from '../services/obligationService'

function ReceivableDetailPage() {
    const navigate = useNavigate()

    const {
        obligationId,
    } = useParams()

    const [entity, setEntity] =
        useState<AccountingEntity | null>(null)

    const [obligation, setObligation] =
        useState<Obligation | null>(null)

    const [customer, setCustomer] =
        useState<Customer | null>(null)

    const [payments, setPayments] =
        useState<ObligationPayment[]>([])

    const [accounts, setAccounts] =
        useState<Account[]>([])

    const [paymentDate, setPaymentDate] =
        useState('')

    const [amount, setAmount] =
        useState('')

    const [cashAccountId, setCashAccountId] =
        useState('')

    const [loading, setLoading] =
        useState(true)

    const [saving, setSaving] =
        useState(false)

    const [error, setError] =
        useState('')

    const loadData = async () => {
        try {
            setLoading(true)
            setError('')

            if (!obligationId) {
                setError(
                    'No se encontró el identificador de la cuenta por cobrar.',
                )
                return
            }

            const entities =
                await getAccountingEntities()

            if (entities.length === 0) {
                setError(
                    'No existe una entidad contable disponible.',
                )
                return
            }

            const selectedEntity =
                entities.find(
                    (item) => item.active,
                ) ?? entities[0]

            setEntity(selectedEntity)

            const obligationData =
                await getObligationById(
                    selectedEntity.id,
                    obligationId,
                )

            setObligation(
                obligationData,
            )

            const [
                paymentList,
                accountList,
            ] = await Promise.all([
                getObligationPayments(
                    selectedEntity.id,
                    obligationId,
                ),

                getAccounts(
                    selectedEntity.id,
                ),
            ])

            setPayments(
                paymentList ?? [],
            )

            setAccounts(
                accountList ?? [],
            )

            if (
                obligationData.customerId
            ) {
                const customerData =
                    await getCustomerById(
                        selectedEntity.id,
                        obligationData.customerId,
                    )

                setCustomer(
                    customerData,
                )
            }
        } catch (exception) {
            console.error(
                'Error cargando cuenta por cobrar:',
                exception,
            )

            setError(
                'No fue posible cargar la cuenta por cobrar.',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [obligationId])

    const availableAccounts =
        useMemo(
            () =>
                accounts.filter(
                    (account) =>
                        account.active &&
                        account.allowsEntries &&
                        account.type === 'ASSET',
                ),
            [accounts],
        )

    const formatCurrency = (
        value: number,
    ) =>
        new Intl.NumberFormat(
            'en-US',
            {
                style: 'currency',
                currency: 'USD',
            },
        ).format(
            Number(value),
        )

    const formatDate = (
        value: string,
    ) => {
        if (!value) {
            return '-'
        }

        return new Intl.DateTimeFormat(
            'es-EC',
            {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            },
        ).format(
            new Date(
                `${value}T00:00:00`,
            ),
        )
    }

    const getStatusLabel = (
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

    const handlePayment = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        if (
            !entity ||
            !obligation ||
            !obligationId
        ) {
            return
        }

        if (
            !paymentDate ||
            !amount ||
            !cashAccountId
        ) {
            setError(
                'Completa todos los datos del cobro.',
            )
            return
        }

        const numericAmount =
            Number(amount)

        if (
            Number.isNaN(
                numericAmount,
            ) ||
            numericAmount <= 0
        ) {
            setError(
                'El valor del cobro debe ser mayor que cero.',
            )
            return
        }

        if (
            numericAmount >
            Number(
                obligation.outstandingAmount,
            )
        ) {
            setError(
                'El valor del cobro no puede superar el saldo pendiente.',
            )
            return
        }

        try {
            setSaving(true)
            setError('')

            await registerObligationPayment(
                entity.id,
                obligationId,
                {
                    paymentDate,

                    amount:
                    numericAmount,

                    cashAccountId,

                    obligationAccountId:
                    obligation.obligationAccountId,
                },
            )

            setPaymentDate('')
            setAmount('')
            setCashAccountId('')

            await loadData()
        } catch (exception) {
            console.error(
                'Error registrando cobro:',
                exception,
            )

            setError(
                'No fue posible registrar el cobro.',
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <LoaderCircle
                        size={38}
                        className="mx-auto animate-spin text-blue-400"
                    />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando cuenta por cobrar...
                    </p>

                </div>

            </div>
        )
    }

    if (
        error &&
        !obligation
    ) {
        return (
            <section className="px-6 py-7 xl:px-8">

                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-6 text-rose-300">
                    {error}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/cuentas-por-cobrar',
                        )
                    }
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-400"
                >
                    <ArrowLeft size={17} />

                    Volver
                </button>

            </section>
        )
    }

    if (!obligation) {
        return null
    }

    return (
        <section className="px-6 py-7 xl:px-8">

            {/* CABECERA */}

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>
                    <p className="text-sm font-semibold text-blue-400">
                        Gestión financiera
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Detalle de cuenta por cobrar
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Consulta el saldo y registra los cobros realizados.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/cuentas-por-cobrar',
                        )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                    <ArrowLeft size={17} />

                    Volver
                </button>

            </div>

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* RESUMEN */}

            <div className="mt-8 grid gap-5 md:grid-cols-3">

                <article className="rounded-2xl border border-blue-400/20 bg-[#071329] p-6">

                    <WalletCards
                        size={25}
                        className="text-blue-400"
                    />

                    <p className="mt-4 text-sm text-slate-400">
                        Valor total
                    </p>

                    <p className="mt-2 text-3xl font-black">
                        {formatCurrency(
                            obligation.totalAmount,
                        )}
                    </p>

                </article>

                <article className="rounded-2xl border border-emerald-400/20 bg-[#071329] p-6">

                    <CircleDollarSign
                        size={25}
                        className="text-emerald-400"
                    />

                    <p className="mt-4 text-sm text-slate-400">
                        Cobrado
                    </p>

                    <p className="mt-2 text-3xl font-black">
                        {formatCurrency(
                            obligation.paidAmount,
                        )}
                    </p>

                </article>

                <article className="rounded-2xl border border-amber-400/20 bg-[#071329] p-6">

                    <Clock3
                        size={25}
                        className="text-amber-400"
                    />

                    <p className="mt-4 text-sm text-slate-400">
                        Pendiente
                    </p>

                    <p className="mt-2 text-3xl font-black">
                        {formatCurrency(
                            obligation.outstandingAmount,
                        )}
                    </p>

                </article>

            </div>

            {/* DATOS */}

            <div className="mt-7 grid gap-6 lg:grid-cols-2">

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                    <h3 className="text-lg font-bold">
                        Información
                    </h3>

                    <div className="mt-6 space-y-5">

                        <div className="flex items-start gap-3">

                            <UserRound
                                size={20}
                                className="mt-1 text-blue-400"
                            />

                            <div>
                                <p className="text-xs uppercase text-slate-500">
                                    Cliente
                                </p>

                                <p className="mt-1 font-semibold">
                                    {customer?.displayName ??
                                        'Sin cliente'}
                                </p>
                            </div>

                        </div>

                        <div className="flex items-start gap-3">

                            <ReceiptText
                                size={20}
                                className="mt-1 text-blue-400"
                            />

                            <div>
                                <p className="text-xs uppercase text-slate-500">
                                    Descripción
                                </p>

                                <p className="mt-1">
                                    {obligation.description}
                                </p>
                            </div>

                        </div>

                        <div>
                            <p className="text-xs uppercase text-slate-500">
                                Fecha de emisión
                            </p>

                            <p className="mt-1">
                                {formatDate(
                                    obligation.issueDate,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase text-slate-500">
                                Vencimiento
                            </p>

                            <p className="mt-1">
                                {formatDate(
                                    obligation.dueDate,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase text-slate-500">
                                Estado
                            </p>

                            <p className="mt-1 font-semibold text-blue-300">
                                {getStatusLabel(
                                    obligation.status,
                                )}
                            </p>
                        </div>

                    </div>

                </article>

                {/* REGISTRAR COBRO */}

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                    <h3 className="text-lg font-bold">
                        Registrar cobro
                    </h3>

                    {obligation.status ===
                    'PAID' ? (
                        <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-5 text-sm text-emerald-300">
                            Esta cuenta ya fue cobrada completamente.
                        </div>
                    ) : obligation.status ===
                    'VOIDED' ? (
                        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-sm text-slate-400">
                            La cuenta está anulada.
                        </div>
                    ) : (
                        <form
                            onSubmit={
                                handlePayment
                            }
                            className="mt-6 space-y-5"
                        >

                            <div>
                                <label className="text-sm font-semibold text-slate-300">
                                    Fecha del cobro *
                                </label>

                                <input
                                    type="date"
                                    value={
                                        paymentDate
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setPaymentDate(
                                            event.target
                                                .value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-300">
                                    Valor a cobrar *
                                </label>

                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    max={
                                        obligation.outstandingAmount
                                    }
                                    value={amount}
                                    onChange={(
                                        event,
                                    ) =>
                                        setAmount(
                                            event.target
                                                .value,
                                        )
                                    }
                                    placeholder="0.00"
                                    className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                                />

                                <p className="mt-2 text-xs text-slate-500">
                                    Máximo:{' '}
                                    {formatCurrency(
                                        obligation.outstandingAmount,
                                    )}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-300">
                                    Cuenta donde ingresa el dinero *
                                </label>

                                <select
                                    value={
                                        cashAccountId
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setCashAccountId(
                                            event.target
                                                .value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                                >
                                    <option value="">
                                        Selecciona una cuenta
                                    </option>

                                    {availableAccounts.map(
                                        (account) => (
                                            <option
                                                key={
                                                    account.id
                                                }
                                                value={
                                                    account.id
                                                }
                                            >
                                                {account.code} -{' '}
                                                {account.name}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                            >
                                {saving && (
                                    <LoaderCircle
                                        size={18}
                                        className="animate-spin"
                                    />
                                )}

                                {saving
                                    ? 'Registrando...'
                                    : 'Registrar cobro'}
                            </button>

                        </form>
                    )}

                </article>

            </div>

            {/* HISTORIAL */}

            <article className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">

                <div className="border-b border-slate-800 px-6 py-5">

                    <h3 className="font-bold">
                        Historial de cobros
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Cobros registrados para esta cuenta.
                    </p>

                </div>

                {payments.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                        Todavía no existen cobros registrados.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead>
                            <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase text-slate-500">

                                <th className="px-6 py-4">
                                    Fecha
                                </th>

                                <th className="px-6 py-4">
                                    Valor
                                </th>

                                <th className="px-6 py-4">
                                    Estado
                                </th>

                            </tr>
                            </thead>

                            <tbody>
                            {payments.map(
                                (payment) => (
                                    <tr
                                        key={
                                            payment.id
                                        }
                                        className="border-b border-slate-800/80 last:border-b-0"
                                    >

                                        <td className="px-6 py-5 text-sm text-slate-300">
                                            {formatDate(
                                                payment.paymentDate,
                                            )}
                                        </td>

                                        <td className="px-6 py-5 font-semibold text-emerald-300">
                                            {formatCurrency(
                                                payment.amount,
                                            )}
                                        </td>

                                        <td className="px-6 py-5">
                                            {payment.status ===
                                            'POSTED' ? (
                                                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            Registrado
                          </span>
                                            ) : (
                                                <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                            Anulado
                          </span>
                                            )}
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

export default ReceivableDetailPage