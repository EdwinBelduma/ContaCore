import {
    ArrowLeft,
    Building2,
    CircleDollarSign,
    Clock3,
    LoaderCircle,
    ReceiptText,
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
    getSupplierById,
    type Supplier,
} from '../services/supplierService'

import {
    getObligationById,
    getObligationPayments,
    registerObligationPayment,
    type Obligation,
    type ObligationPayment,
} from '../services/obligationService'

function PayableDetailPage() {
    const navigate =
        useNavigate()

    const {
        obligationId,
    } = useParams()

    const [
        entity,
        setEntity,
    ] =
        useState<AccountingEntity | null>(
            null,
        )

    const [
        obligation,
        setObligation,
    ] =
        useState<Obligation | null>(
            null,
        )

    const [
        supplier,
        setSupplier,
    ] =
        useState<Supplier | null>(
            null,
        )

    const [
        payments,
        setPayments,
    ] =
        useState<ObligationPayment[]>([])

    const [
        accounts,
        setAccounts,
    ] =
        useState<Account[]>([])

    const [
        paymentDate,
        setPaymentDate,
    ] =
        useState('')

    const [
        amount,
        setAmount,
    ] =
        useState('')

    const [
        cashAccountId,
        setCashAccountId,
    ] =
        useState('')

    const [
        loading,
        setLoading,
    ] =
        useState(true)

    const [
        saving,
        setSaving,
    ] =
        useState(false)

    const [
        error,
        setError,
    ] =
        useState('')

    /*
     * CARGAR INFORMACIÓN
     */

    const loadData =
        async () => {
            try {
                setLoading(true)
                setError('')

                /*
                 * VALIDAR ID
                 */

                if (!obligationId) {
                    setError(
                        'No se encontró el identificador de la cuenta por pagar.',
                    )

                    return
                }

                /*
                 * OBTENER ENTIDAD CONTABLE
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
                 * OBTENER OBLIGACIÓN
                 */

                const obligationData =
                    await getObligationById(
                        selectedEntity.id,
                        obligationId,
                    )

                /*
                 * COMPROBAR QUE SEA
                 * CUENTA POR PAGAR
                 */

                if (
                    obligationData.type !==
                    'PAYABLE'
                ) {
                    setError(
                        'La obligación seleccionada no corresponde a una cuenta por pagar.',
                    )

                    return
                }

                setObligation(
                    obligationData,
                )

                /*
                 * OBTENER PAGOS
                 * Y CUENTAS CONTABLES
                 */

                const [
                    paymentList,
                    accountList,
                ] =
                    await Promise.all([
                        getObligationPayments(
                            selectedEntity.id,
                            obligationId,
                        ),

                        getAccounts(
                            selectedEntity.id,
                        ),
                    ])

                setPayments(
                    paymentList ??
                    [],
                )

                setAccounts(
                    accountList ??
                    [],
                )

                /*
                 * OBTENER PROVEEDOR
                 */

                if (
                    obligationData.supplierId
                ) {
                    const supplierData =
                        await getSupplierById(
                            selectedEntity.id,
                            obligationData.supplierId,
                        )

                    setSupplier(
                        supplierData,
                    )
                } else {
                    setSupplier(null)
                }
            } catch (
                exception
                ) {
                console.error(
                    'Error cargando cuenta por pagar:',
                    exception,
                )

                setError(
                    'No fue posible cargar la cuenta por pagar.',
                )
            } finally {
                setLoading(false)
            }
        }

    /*
     * CARGAR AL ENTRAR
     */

    useEffect(() => {
        loadData()
    }, [
        obligationId,
    ])

    /*
     * CUENTAS DESDE DONDE
     * SALE EL DINERO
     *
     * Para realizar el pago
     * utilizamos cuentas ASSET,
     * por ejemplo Caja o Bancos.
     */

    const availableAccounts =
        useMemo(
            () =>
                accounts.filter(
                    (account) =>
                        account.active &&
                        account.allowsEntries &&
                        account.type ===
                        'ASSET',
                ),
            [
                accounts,
            ],
        )

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
     * REGISTRAR PAGO
     */

    const handlePayment =
        async (
            event:
            FormEvent<HTMLFormElement>,
        ) => {
            event.preventDefault()

            if (
                !entity ||
                !obligation ||
                !obligationId
            ) {
                return
            }

            /*
             * VALIDAR CAMPOS
             */

            if (
                !paymentDate ||
                !amount ||
                !cashAccountId
            ) {
                setError(
                    'Completa todos los datos del pago.',
                )

                return
            }

            const numericAmount =
                Number(
                    amount,
                )

            /*
             * VALIDAR MONTO
             */

            if (
                Number.isNaN(
                    numericAmount,
                ) ||
                numericAmount <= 0
            ) {
                setError(
                    'El valor del pago debe ser mayor que cero.',
                )

                return
            }

            /*
             * NO PERMITIR PAGAR MÁS
             * DEL SALDO PENDIENTE
             */

            if (
                numericAmount >
                Number(
                    obligation.outstandingAmount,
                )
            ) {
                setError(
                    'El valor del pago no puede superar el saldo pendiente.',
                )

                return
            }

            try {
                setSaving(true)
                setError('')

                /*
                 * REGISTRAR PAGO
                 */

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

                /*
                 * LIMPIAR FORMULARIO
                 */

                setPaymentDate('')
                setAmount('')
                setCashAccountId('')

                /*
                 * RECARGAR DATOS
                 *
                 * Esto actualizará:
                 * - Pagado
                 * - Pendiente
                 * - Estado
                 * - Historial
                 */

                await loadData()
            } catch (
                exception
                ) {
                console.error(
                    'Error registrando pago:',
                    exception,
                )

                setError(
                    'No fue posible registrar el pago.',
                )
            } finally {
                setSaving(false)
            }
        }

    /*
     * CARGANDO
     */

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <LoaderCircle
                        size={38}
                        className="mx-auto animate-spin text-violet-400"
                    />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando cuenta por pagar...
                    </p>

                </div>

            </div>
        )
    }

    /*
     * ERROR SIN OBLIGACIÓN
     */

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
                            '/cuentas-por-pagar',
                        )
                    }
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-400"
                >

                    <ArrowLeft
                        size={17}
                    />

                    Volver

                </button>

            </section>
        )
    }

    /*
     * SIN OBLIGACIÓN
     */

    if (!obligation) {
        return null
    }

    return (
        <section className="px-6 py-7 xl:px-8">

            {/* =========================
          CABECERA
      ========================= */}

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                    <p className="text-sm font-semibold text-violet-400">
                        Gestión financiera
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Detalle de cuenta por pagar
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Consulta el saldo pendiente y registra los pagos realizados al proveedor.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/cuentas-por-pagar',
                        )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                >

                    <ArrowLeft
                        size={17}
                    />

                    Volver

                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* =========================
          RESUMEN
      ========================= */}

            <div className="mt-8 grid gap-5 md:grid-cols-3">

                {/* TOTAL */}

                <article className="rounded-2xl border border-violet-400/20 bg-[#071329] p-6">

                    <WalletCards
                        size={25}
                        className="text-violet-400"
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

                {/* PAGADO */}

                <article className="rounded-2xl border border-emerald-400/20 bg-[#071329] p-6">

                    <CircleDollarSign
                        size={25}
                        className="text-emerald-400"
                    />

                    <p className="mt-4 text-sm text-slate-400">
                        Pagado
                    </p>

                    <p className="mt-2 text-3xl font-black">
                        {formatCurrency(
                            obligation.paidAmount,
                        )}
                    </p>

                </article>

                {/* PENDIENTE */}

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

            {/* =========================
          INFORMACIÓN + PAGO
      ========================= */}

            <div className="mt-7 grid gap-6 lg:grid-cols-2">

                {/* INFORMACIÓN */}

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                    <h3 className="text-lg font-bold">
                        Información
                    </h3>

                    <div className="mt-6 space-y-5">

                        {/* PROVEEDOR */}

                        <div className="flex items-start gap-3">

                            <Building2
                                size={20}
                                className="mt-1 text-violet-400"
                            />

                            <div>

                                <p className="text-xs uppercase text-slate-500">
                                    Proveedor
                                </p>

                                <p className="mt-1 font-semibold">
                                    {supplier?.displayName ??
                                        'Sin proveedor'}
                                </p>

                                {supplier?.taxIdentifier && (
                                    <p className="mt-1 text-xs text-slate-500">
                                        {
                                            supplier.taxIdentifier
                                        }
                                    </p>
                                )}

                            </div>

                        </div>

                        {/* DESCRIPCIÓN */}

                        <div className="flex items-start gap-3">

                            <ReceiptText
                                size={20}
                                className="mt-1 text-violet-400"
                            />

                            <div>

                                <p className="text-xs uppercase text-slate-500">
                                    Descripción
                                </p>

                                <p className="mt-1">
                                    {
                                        obligation.description
                                    }
                                </p>

                            </div>

                        </div>

                        {/* REFERENCIA */}

                        <div>

                            <p className="text-xs uppercase text-slate-500">
                                Referencia
                            </p>

                            <p className="mt-1">
                                {obligation.reference ||
                                    'Sin referencia'}
                            </p>

                        </div>

                        {/* FECHA EMISIÓN */}

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

                        {/* VENCIMIENTO */}

                        <div>

                            <p className="text-xs uppercase text-slate-500">
                                Fecha de vencimiento
                            </p>

                            <p className="mt-1">
                                {formatDate(
                                    obligation.dueDate,
                                )}
                            </p>

                        </div>

                        {/* ESTADO */}

                        <div>

                            <p className="text-xs uppercase text-slate-500">
                                Estado
                            </p>

                            <div className="mt-2">

                <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                        obligation.status,
                    )}`}
                >
                  {getStatusLabel(
                      obligation.status,
                  )}
                </span>

                            </div>

                        </div>

                    </div>

                </article>

                {/* =========================
            REGISTRAR PAGO
        ========================= */}

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                    <h3 className="text-lg font-bold">
                        Registrar pago
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        Registra un pago parcial o total realizado al proveedor.
                    </p>

                    {/* CUENTA PAGADA */}

                    {obligation.status ===
                    'PAID' ? (
                        <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-5 text-sm text-emerald-300">

                            Esta cuenta ya fue pagada completamente.

                        </div>
                    ) : obligation.status ===
                    'VOIDED' ? (
                        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-sm text-slate-400">

                            La cuenta está anulada y no admite nuevos pagos.

                        </div>
                    ) : (
                        <form
                            onSubmit={
                                handlePayment
                            }
                            className="mt-6 space-y-5"
                        >

                            {/* FECHA */}

                            <div>

                                <label className="text-sm font-semibold text-slate-300">
                                    Fecha del pago *
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
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                                />

                            </div>

                            {/* VALOR */}

                            <div>

                                <label className="text-sm font-semibold text-slate-300">
                                    Valor a pagar *
                                </label>

                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    max={
                                        obligation.outstandingAmount
                                    }
                                    value={
                                        amount
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setAmount(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="0.00"
                                    className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                                />

                                <p className="mt-2 text-xs text-slate-500">
                                    Máximo a pagar:{' '}
                                    <span className="font-semibold text-amber-300">
                    {formatCurrency(
                        obligation.outstandingAmount,
                    )}
                  </span>
                                </p>

                            </div>

                            {/* CUENTA */}

                            <div>

                                <label className="text-sm font-semibold text-slate-300">
                                    Cuenta desde donde sale el dinero *
                                </label>

                                <select
                                    value={
                                        cashAccountId
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setCashAccountId(
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                                >

                                    <option value="">
                                        Selecciona Caja o Banco
                                    </option>

                                    {availableAccounts.map(
                                        (
                                            account,
                                        ) => (
                                            <option
                                                key={
                                                    account.id
                                                }
                                                value={
                                                    account.id
                                                }
                                            >
                                                {
                                                    account.code
                                                }{' '}
                                                -{' '}
                                                {
                                                    account.name
                                                }
                                            </option>
                                        ),
                                    )}

                                </select>

                                {availableAccounts.length ===
                                    0 && (
                                        <p className="mt-2 text-xs text-amber-400">
                                            No existen cuentas de activo habilitadas para registrar el pago.
                                        </p>
                                    )}

                            </div>

                            {/* BOTÓN */}

                            <button
                                type="submit"
                                disabled={
                                    saving
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {saving && (
                                    <LoaderCircle
                                        size={18}
                                        className="animate-spin"
                                    />
                                )}

                                {saving
                                    ? 'Registrando...'
                                    : 'Registrar pago'}

                            </button>

                        </form>
                    )}

                </article>

            </div>

            {/* =========================
          HISTORIAL DE PAGOS
      ========================= */}

            <article className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">

                <div className="border-b border-slate-800 px-6 py-5">

                    <h3 className="font-bold">
                        Historial de pagos
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Pagos registrados para esta cuenta por pagar.
                    </p>

                </div>

                {payments.length ===
                0 ? (
                    <div className="px-6 py-12 text-center">

                        <CircleDollarSign
                            size={32}
                            className="mx-auto text-slate-600"
                        />

                        <p className="mt-4 text-sm text-slate-500">
                            Todavía no existen pagos registrados.
                        </p>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[600px]">

                            <thead>

                            <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase tracking-wide text-slate-500">

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
                                (
                                    payment,
                                ) => (
                                    <tr
                                        key={
                                            payment.id
                                        }
                                        className="border-b border-slate-800/80 last:border-b-0"
                                    >

                                        {/* FECHA */}

                                        <td className="px-6 py-5 text-sm text-slate-300">

                                            {formatDate(
                                                payment.paymentDate,
                                            )}

                                        </td>

                                        {/* VALOR */}

                                        <td className="px-6 py-5 font-semibold text-violet-300">

                                            {formatCurrency(
                                                payment.amount,
                                            )}

                                        </td>

                                        {/* ESTADO */}

                                        <td className="px-6 py-5">

                                            {payment.status ===
                                            'POSTED' ? (
                                                <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">

                            Registrado

                          </span>
                                            ) : (
                                                <span className="inline-flex rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">

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

export default PayableDetailPage