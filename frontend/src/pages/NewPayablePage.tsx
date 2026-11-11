import {
    ArrowLeft,
    LoaderCircle,
    Save,
} from 'lucide-react'

import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
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
    getAccounts,
    type Account,
} from '../services/accountService'

import {
    createObligation,
} from '../services/obligationService'

function NewPayablePage() {
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
        supplierId,
        setSupplierId,
    ] =
        useState('')

    const [
        issueDate,
        setIssueDate,
    ] =
        useState('')

    const [
        dueDate,
        setDueDate,
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
        totalAmount,
        setTotalAmount,
    ] =
        useState('')

    const [
        obligationAccountId,
        setObligationAccountId,
    ] =
        useState('')

    const [
        counterpartAccountId,
        setCounterpartAccountId,
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
                     * 1. OBTENER ENTIDAD
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
                     * 2. OBTENER PROVEEDORES
                     * Y CUENTAS CONTABLES
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
                        (
                            supplierList ??
                            []
                        ).filter(
                            (supplier) =>
                                supplier.active,
                        ),
                    )

                    setAccounts(
                        accountList ??
                        [],
                    )
                } catch (
                    exception
                    ) {
                    console.error(
                        'Error cargando formulario de cuenta por pagar:',
                        exception,
                    )

                    setError(
                        'No fue posible cargar los proveedores y las cuentas contables.',
                    )
                } finally {
                    setLoading(false)
                }
            }

        loadData()
    }, [])

    /*
     * CUENTAS POR PAGAR
     *
     * Una cuenta por pagar normalmente
     * corresponde a un PASIVO.
     */

    const payableAccounts =
        useMemo(
            () =>
                accounts.filter(
                    (account) =>
                        account.active &&
                        account.allowsEntries &&
                        account.type ===
                        'LIABILITY',
                ),
            [
                accounts,
            ],
        )

    /*
     * CUENTA DE GASTO
     *
     * Es la contrapartida de la
     * obligación con el proveedor.
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
            [
                accounts,
            ],
        )

    /*
     * GUARDAR CUENTA POR PAGAR
     */

    const handleSubmit =
        async (
            event:
            FormEvent<HTMLFormElement>,
        ) => {
            event.preventDefault()

            if (!entity) {
                setError(
                    'No existe una entidad contable seleccionada.',
                )

                return
            }

            /*
             * VALIDACIONES
             */

            if (
                !supplierId ||
                !issueDate ||
                !dueDate ||
                !description.trim() ||
                !totalAmount ||
                !obligationAccountId ||
                !counterpartAccountId
            ) {
                setError(
                    'Completa todos los campos obligatorios.',
                )

                return
            }

            if (
                dueDate <
                issueDate
            ) {
                setError(
                    'La fecha de vencimiento no puede ser anterior a la fecha de emisión.',
                )

                return
            }

            const numericAmount =
                Number(
                    totalAmount,
                )

            if (
                Number.isNaN(
                    numericAmount,
                ) ||
                numericAmount <= 0
            ) {
                setError(
                    'El valor debe ser mayor que cero.',
                )

                return
            }

            try {
                setSaving(true)
                setError('')

                /*
                 * CREAR OBLIGACIÓN
                 */

                await createObligation(
                    entity.id,
                    {
                        type:
                            'PAYABLE',

                        /*
                         * CUENTA POR PAGAR
                         * NO TIENE CLIENTE
                         */

                        customerId:
                            null,

                        /*
                         * PROVEEDOR
                         */

                        supplierId,

                        issueDate,

                        dueDate,

                        description:
                            description.trim(),

                        reference:
                            reference.trim()
                                ? reference.trim()
                                : null,

                        obligationAccountId,

                        counterpartAccountId,

                        totalAmount:
                        numericAmount,
                    },
                )

                /*
                 * VOLVER A LA LISTA
                 */

                navigate(
                    '/cuentas-por-pagar',
                    {
                        replace: true,
                    },
                )
            } catch (
                exception
                ) {
                console.error(
                    'Error creando cuenta por pagar:',
                    exception,
                )

                setError(
                    'No fue posible registrar la cuenta por pagar. Revisa los datos e inténtalo nuevamente.',
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
                        Cargando formulario...
                    </p>

                </div>

            </div>
        )
    }

    return (
        <section className="px-6 py-7 xl:px-8">

            {/* CABECERA */}

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                <div>

                    <p className="text-sm font-semibold text-violet-400">
                        Gestión financiera
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Nueva cuenta por pagar
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Registra una obligación pendiente de pago con un proveedor.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/cuentas-por-pagar',
                        )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
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

            {/* ENTIDAD */}

            {entity && (
                <div className="mt-6 rounded-xl border border-violet-400/10 bg-violet-500/5 px-5 py-4">

                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Entidad contable
                    </p>

                    <p className="mt-1 font-semibold text-slate-200">
                        {entity.displayName}
                    </p>

                </div>
            )}

            {/* FORMULARIO */}

            <form
                onSubmit={
                    handleSubmit
                }
                className="mt-7 rounded-2xl border border-slate-800 bg-[#071329] p-6"
            >

                <div className="grid gap-6 md:grid-cols-2">

                    {/* PROVEEDOR */}

                    <div>

                        <label className="text-sm font-semibold text-slate-300">
                            Proveedor *
                        </label>

                        <select
                            value={
                                supplierId
                            }
                            onChange={(
                                event,
                            ) =>
                                setSupplierId(
                                    event.target.value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                        >

                            <option value="">
                                Selecciona un proveedor
                            </option>

                            {suppliers.map(
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

                        {suppliers.length ===
                            0 && (
                                <p className="mt-2 text-xs text-amber-400">
                                    No existen proveedores activos. Registra un proveedor antes de crear una cuenta por pagar.
                                </p>
                            )}

                    </div>

                    {/* VALOR */}

                    <div>

                        <label className="text-sm font-semibold text-slate-300">
                            Valor total *
                        </label>

                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={
                                totalAmount
                            }
                            onChange={(
                                event,
                            ) =>
                                setTotalAmount(
                                    event.target.value,
                                )
                            }
                            placeholder="0.00"
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                        />

                    </div>

                    {/* FECHA EMISIÓN */}

                    <div>

                        <label className="text-sm font-semibold text-slate-300">
                            Fecha de emisión *
                        </label>

                        <input
                            type="date"
                            value={
                                issueDate
                            }
                            onChange={(
                                event,
                            ) =>
                                setIssueDate(
                                    event.target.value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                        />

                    </div>

                    {/* FECHA VENCIMIENTO */}

                    <div>

                        <label className="text-sm font-semibold text-slate-300">
                            Fecha de vencimiento *
                        </label>

                        <input
                            type="date"
                            value={
                                dueDate
                            }
                            min={
                                issueDate ||
                                undefined
                            }
                            onChange={(
                                event,
                            ) =>
                                setDueDate(
                                    event.target.value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                        />

                    </div>

                    {/* DESCRIPCIÓN */}

                    <div className="md:col-span-2">

                        <label className="text-sm font-semibold text-slate-300">
                            Descripción *
                        </label>

                        <input
                            type="text"
                            maxLength={
                                255
                            }
                            value={
                                description
                            }
                            onChange={(
                                event,
                            ) =>
                                setDescription(
                                    event.target.value,
                                )
                            }
                            placeholder="Ej. Compra de mercadería a crédito"
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                        />

                    </div>

                    {/* REFERENCIA */}

                    <div>

                        <label className="text-sm font-semibold text-slate-300">
                            Referencia
                        </label>

                        <input
                            type="text"
                            maxLength={
                                100
                            }
                            value={
                                reference
                            }
                            onChange={(
                                event,
                            ) =>
                                setReference(
                                    event.target.value,
                                )
                            }
                            placeholder="Ej. FACT-001"
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                        />

                    </div>

                    {/* CUENTA POR PAGAR */}

                    <div>

                        <label className="text-sm font-semibold text-slate-300">
                            Cuenta por pagar *
                        </label>

                        <select
                            value={
                                obligationAccountId
                            }
                            onChange={(
                                event,
                            ) =>
                                setObligationAccountId(
                                    event.target.value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                        >

                            <option value="">
                                Selecciona una cuenta de pasivo
                            </option>

                            {payableAccounts.map(
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

                        {payableAccounts.length ===
                            0 && (
                                <p className="mt-2 text-xs text-amber-400">
                                    No existen cuentas de pasivo habilitadas para movimientos.
                                </p>
                            )}

                    </div>

                    {/* CUENTA DE GASTO */}

                    <div className="md:col-span-2">

                        <label className="text-sm font-semibold text-slate-300">
                            Cuenta de gasto *
                        </label>

                        <select
                            value={
                                counterpartAccountId
                            }
                            onChange={(
                                event,
                            ) =>
                                setCounterpartAccountId(
                                    event.target.value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                        >

                            <option value="">
                                Selecciona una cuenta de gasto
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

                        {expenseAccounts.length ===
                            0 && (
                                <p className="mt-2 text-xs text-amber-400">
                                    No existen cuentas de gasto habilitadas para movimientos.
                                </p>
                            )}

                    </div>

                </div>

                {/* BOTONES */}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                    <button
                        type="button"
                        disabled={
                            saving
                        }
                        onClick={() =>
                            navigate(
                                '/cuentas-por-pagar',
                            )
                        }
                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={
                            saving
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {saving ? (
                            <LoaderCircle
                                size={18}
                                className="animate-spin"
                            />
                        ) : (
                            <Save
                                size={18}
                            />
                        )}

                        {saving
                            ? 'Guardando...'
                            : 'Guardar cuenta por pagar'}

                    </button>

                </div>

            </form>

        </section>
    )
}

export default NewPayablePage