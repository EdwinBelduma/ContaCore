import {
    ArrowLeft,
    CalendarDays,
    DollarSign,
    FileText,
    LoaderCircle,
    ReceiptText,
    Store,
    WalletCards,
} from 'lucide-react'

import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import type {
    FormEvent,
} from 'react'

import {
    useNavigate,
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
    createExpense,
} from '../services/expenseService'

import {
    getSuppliers,
    type Supplier,
} from '../services/supplierService'

function getCurrentDate() {
    const now = new Date()

    const year =
        now.getFullYear()

    const month =
        String(
            now.getMonth() + 1,
        ).padStart(2, '0')

    const day =
        String(
            now.getDate(),
        ).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function NewExpensePage() {
    const navigate = useNavigate()

    const [
        entity,
        setEntity,
    ] =
        useState<AccountingEntity | null>(
            null,
        )

    const [
        suppliers,
        setSuppliers,
    ] =
        useState<Supplier[]>([])

    const [
        accounts,
        setAccounts,
    ] =
        useState<Account[]>([])

    const [
        expenseDate,
        setExpenseDate,
    ] =
        useState(
            getCurrentDate(),
        )

    const [
        amount,
        setAmount,
    ] =
        useState('')

    const [
        description,
        setDescription,
    ] =
        useState('')

    const [
        reference,
        setReference,
    ] =
        useState('')

    const [
        supplierId,
        setSupplierId,
    ] =
        useState('')

    const [
        expenseAccountId,
        setExpenseAccountId,
    ] =
        useState('')

    const [
        paymentAccountId,
        setPaymentAccountId,
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
     * CARGAR DATOS
     */

    useEffect(() => {
        const loadData =
            async () => {
                try {
                    setLoading(true)
                    setError('')

                    /*
                     * 1. ENTIDAD CONTABLE
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
                     * 2. PROVEEDORES Y CUENTAS
                     */

                    const [
                        supplierList,
                        accountList,
                    ] =
                        await Promise.all([
                            getSuppliers(
                                selectedEntity.id,
                            ),

                            getAccounts(
                                selectedEntity.id,
                            ),
                        ])

                    setSuppliers(
                        supplierList ?? [],
                    )

                    setAccounts(
                        accountList ?? [],
                    )
                } catch (
                    exception
                    ) {
                    console.error(
                        'Error cargando datos para nuevo gasto:',
                        exception,
                    )

                    setError(
                        'No fue posible cargar la información necesaria.',
                    )
                } finally {
                    setLoading(false)
                }
            }

        loadData()
    }, [])

    /*
     * CUENTAS DE GASTO
     *
     * Solo:
     * EXPENSE
     * activas
     * permiten movimientos
     */

    const expenseAccounts =
        useMemo(
            () =>
                accounts.filter(
                    (account) =>
                        account.active &&
                        account.allowsEntries &&
                        account.type ===
                        'EXPENSE',
                ),
            [accounts],
        )

    /*
     * CUENTAS DE PAGO
     *
     * El backend exige ASSET.
     *
     * Ejemplo:
     * CAJA
     * BANCO
     */

    const paymentAccounts =
        useMemo(
            () =>
                accounts.filter(
                    (account) =>
                        account.active &&
                        account.allowsEntries &&
                        account.type ===
                        'ASSET',
                ),
            [accounts],
        )

    /*
     * PROVEEDORES ACTIVOS
     */

    const activeSuppliers =
        useMemo(
            () =>
                suppliers.filter(
                    (supplier) =>
                        supplier.active,
                ),
            [suppliers],
        )

    /*
     * GUARDAR GASTO
     */

    const handleSubmit =
        async (
            event: FormEvent<HTMLFormElement>,
        ) => {
            event.preventDefault()

            if (!entity) {
                setError(
                    'No existe una entidad contable seleccionada.',
                )

                return
            }

            if (!expenseDate) {
                setError(
                    'Debes seleccionar la fecha del gasto.',
                )

                return
            }

            const numericAmount =
                Number(amount)

            if (
                !numericAmount ||
                numericAmount <= 0
            ) {
                setError(
                    'El monto debe ser mayor que cero.',
                )

                return
            }

            if (
                !description.trim()
            ) {
                setError(
                    'Debes ingresar una descripción.',
                )

                return
            }

            if (
                !expenseAccountId
            ) {
                setError(
                    'Debes seleccionar una cuenta de gasto.',
                )

                return
            }

            if (
                !paymentAccountId
            ) {
                setError(
                    'Debes seleccionar la cuenta de pago.',
                )

                return
            }

            if (
                expenseAccountId ===
                paymentAccountId
            ) {
                setError(
                    'La cuenta de gasto y la cuenta de pago deben ser diferentes.',
                )

                return
            }

            try {
                setSaving(true)
                setError('')

                await createExpense(
                    entity.id,
                    {
                        supplierId:
                            supplierId ||
                            null,

                        expenseDate,

                        description:
                            description.trim(),

                        reference:
                            reference.trim() ||
                            null,

                        amount:
                        numericAmount,

                        expenseAccountId,

                        paymentAccountId,
                    },
                )

                /*
                 * El gasto queda inicialmente
                 * en estado DRAFT.
                 */

                navigate(
                    '/gastos',
                )
            } catch (
                exception
                ) {
                console.error(
                    'Error creando gasto:',
                    exception,
                )

                setError(
                    'No fue posible registrar el gasto. Revisa los datos e inténtalo nuevamente.',
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

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-rose-500/20 border-t-rose-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando formulario...
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

                    <p className="text-sm font-semibold text-rose-400">
                        Gestión financiera
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Nuevo gasto
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                        {entity
                            ? `Registra un nuevo gasto para ${entity.displayName}.`
                            : 'Registra un nuevo gasto.'}

                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/gastos',
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/50 hover:text-white"
                >
                    <ArrowLeft
                        size={17}
                    />

                    Volver a Gastos
                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* FORMULARIO */}

            <form
                onSubmit={
                    handleSubmit
                }
                className="mt-8"
            >

                <div className="grid gap-6 xl:grid-cols-[1fr_340px]">

                    {/* FORMULARIO PRINCIPAL */}

                    <div className="space-y-6">

                        {/* INFORMACIÓN GENERAL */}

                        <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">

                                    <ReceiptText
                                        size={20}
                                    />

                                </div>

                                <div>

                                    <h3 className="font-bold">
                                        Información del gasto
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Ingresa los datos principales del gasto.
                                    </p>

                                </div>

                            </div>

                            <div className="mt-6 grid gap-5 md:grid-cols-2">

                                {/* FECHA */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                                        Fecha del gasto
                                    </label>

                                    <div className="relative">

                                        <CalendarDays
                                            size={17}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />

                                        <input
                                            type="date"
                                            value={
                                                expenseDate
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setExpenseDate(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            required
                                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-rose-500/50"
                                        />

                                    </div>

                                </div>

                                {/* MONTO */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                                        Monto
                                    </label>

                                    <div className="relative">

                                        <DollarSign
                                            size={17}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />

                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={
                                                amount
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setAmount(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="0.00"
                                            required
                                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-rose-500/50"
                                        />

                                    </div>

                                </div>

                                {/* DESCRIPCIÓN */}

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                                        Descripción
                                    </label>

                                    <div className="relative">

                                        <FileText
                                            size={17}
                                            className="pointer-events-none absolute left-4 top-4 text-slate-500"
                                        />

                                        <textarea
                                            value={
                                                description
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setDescription(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Ejemplo: Pago de energía eléctrica"
                                            rows={4}
                                            required
                                            className="w-full resize-none rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-rose-500/50"
                                        />

                                    </div>

                                </div>

                                {/* REFERENCIA */}

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">

                                        Referencia

                                        <span className="ml-2 text-xs font-normal text-slate-500">
                      Opcional
                    </span>

                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            reference
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setReference(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Ejemplo: FACT-00125"
                                        className="w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-rose-500/50"
                                    />

                                </div>

                            </div>

                        </article>

                        {/* PROVEEDOR */}

                        <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                                    <Store
                                        size={20}
                                    />

                                </div>

                                <div>

                                    <h3 className="font-bold">
                                        Proveedor
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Puedes asociar el gasto a un proveedor.
                                    </p>

                                </div>

                            </div>

                            <div className="mt-6">

                                <label className="mb-2 block text-sm font-semibold text-slate-300">

                                    Proveedor

                                    <span className="ml-2 text-xs font-normal text-slate-500">
                    Opcional
                  </span>

                                </label>

                                <select
                                    value={
                                        supplierId
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setSupplierId(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                                >

                                    <option value="">
                                        Sin proveedor
                                    </option>

                                    {activeSuppliers.map(
                                        (
                                            supplier,
                                        ) => (
                                            <option
                                                key={
                                                    supplier.id
                                                }
                                                value={
                                                    supplier.id
                                                }
                                            >
                                                {
                                                    supplier.displayName
                                                }
                                            </option>
                                        ),
                                    )}

                                </select>

                                {activeSuppliers.length ===
                                    0 && (
                                        <p className="mt-2 text-xs text-slate-500">
                                            No hay proveedores activos registrados. Puedes guardar el gasto sin proveedor.
                                        </p>
                                    )}

                            </div>

                        </article>

                        {/* CONTABILIZACIÓN */}

                        <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">

                                    <WalletCards
                                        size={20}
                                    />

                                </div>

                                <div>

                                    <h3 className="font-bold">
                                        Contabilización
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Selecciona las cuentas que utilizará este gasto.
                                    </p>

                                </div>

                            </div>

                            <div className="mt-6 grid gap-5 md:grid-cols-2">

                                {/* CUENTA DE GASTO */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                                        Cuenta de gasto
                                    </label>

                                    <select
                                        value={
                                            expenseAccountId
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setExpenseAccountId(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-rose-500/50"
                                    >

                                        <option value="">
                                            Selecciona una cuenta
                                        </option>

                                        {expenseAccounts.map(
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
                                                    {account.code} - {account.name}
                                                </option>
                                            ),
                                        )}

                                    </select>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Cuenta contable de tipo GASTO.
                                    </p>

                                </div>

                                {/* CUENTA DE PAGO */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                                        Cuenta de pago
                                    </label>

                                    <select
                                        value={
                                            paymentAccountId
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setPaymentAccountId(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-rose-500/50"
                                    >

                                        <option value="">
                                            Selecciona de dónde sale el dinero
                                        </option>

                                        {paymentAccounts.map(
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
                                                    {account.code} - {account.name}
                                                </option>
                                            ),
                                        )}

                                    </select>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Por ejemplo: CAJA o BANCO.
                                    </p>

                                </div>

                            </div>

                            {expenseAccounts.length ===
                                0 && (
                                    <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                                        No existen cuentas activas de tipo EXPENSE que permitan movimientos.
                                    </div>
                                )}

                            {paymentAccounts.length ===
                                0 && (
                                    <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                                        No existen cuentas activas de tipo ASSET que permitan registrar el pago.
                                    </div>
                                )}

                        </article>

                    </div>

                    {/* RESUMEN */}

                    <aside className="space-y-6">

                        <article className="rounded-2xl border border-rose-400/20 bg-[#071329] p-6">

                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-400">
                                Resumen
                            </p>

                            <h3 className="mt-2 text-xl font-black">
                                Nuevo gasto
                            </h3>

                            <div className="mt-6 space-y-4">

                                <div className="border-b border-slate-800 pb-4">

                                    <p className="text-xs text-slate-500">
                                        Fecha
                                    </p>

                                    <p className="mt-1 text-sm font-semibold">
                                        {expenseDate ||
                                            'Sin fecha'}
                                    </p>

                                </div>

                                <div className="border-b border-slate-800 pb-4">

                                    <p className="text-xs text-slate-500">
                                        Monto
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-rose-400">

                                        {new Intl.NumberFormat(
                                            'es-EC',
                                            {
                                                style:
                                                    'currency',
                                                currency:
                                                    'USD',
                                            },
                                        ).format(
                                            Number(
                                                amount,
                                            ) || 0,
                                        )}

                                    </p>

                                </div>

                                <div>

                                    <p className="text-xs text-slate-500">
                                        Estado inicial
                                    </p>

                                    <span className="mt-2 inline-flex rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                    Borrador
                  </span>

                                </div>

                            </div>

                        </article>

                        {/* INFORMACIÓN */}

                        <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                            <h3 className="font-bold">
                                ¿Qué ocurrirá al guardar?
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                El gasto será registrado inicialmente como borrador.
                                Todavía no afectará los reportes contables.
                            </p>

                            <p className="mt-3 text-sm leading-6 text-slate-400">

                                Después podrás utilizar la acción

                                <span className="font-semibold text-emerald-400">
                  {' '}Contabilizar{' '}
                </span>

                                desde la pantalla de Gastos.

                            </p>

                        </article>

                    </aside>

                </div>

                {/* BOTONES */}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">

                    <button
                        type="button"
                        disabled={
                            saving
                        }
                        onClick={() =>
                            navigate(
                                '/gastos',
                            )
                        }
                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={
                            saving ||
                            expenseAccounts.length ===
                            0 ||
                            paymentAccounts.length ===
                            0
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/10 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {saving ? (
                            <>
                                <LoaderCircle
                                    size={18}
                                    className="animate-spin"
                                />

                                Guardando...
                            </>
                        ) : (
                            <>
                                <ReceiptText
                                    size={18}
                                />

                                Guardar gasto
                            </>
                        )}

                    </button>

                </div>

            </form>

        </section>
    )
}

export default NewExpensePage