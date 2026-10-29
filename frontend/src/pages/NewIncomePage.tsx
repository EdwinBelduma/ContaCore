import {
    CalendarDays,
    DollarSign,
    FileText,
    LoaderCircle,
    Save,
    UserRound,
    WalletCards,
} from 'lucide-react'

import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react'

import { useNavigate } from 'react-router-dom'

import {
    getAccountingEntities,
    type AccountingEntity,
} from '../services/accountingEntityService'

import {
    getCustomers,
    type Customer,
} from '../services/customerService'

import {
    getAccounts,
    type Account,
} from '../services/accountService'

import {
    createIncome,
} from '../services/incomeService'

function NewIncomePage() {
    const navigate = useNavigate()

    const [entity, setEntity] =
        useState<AccountingEntity | null>(
            null,
        )

    const [customers, setCustomers] =
        useState<Customer[]>([])

    const [accounts, setAccounts] =
        useState<Account[]>([])

    const [incomeDate, setIncomeDate] =
        useState('')

    const [description, setDescription] =
        useState('')

    const [reference, setReference] =
        useState('')

    const [amount, setAmount] =
        useState('')

    const [customerId, setCustomerId] =
        useState('')

    const [
        incomeAccountId,
        setIncomeAccountId,
    ] = useState('')

    const [
        receiptAccountId,
        setReceiptAccountId,
    ] = useState('')

    const [loading, setLoading] =
        useState(true)

    const [saving, setSaving] =
        useState(false)

    const [error, setError] =
        useState('')

    useEffect(() => {
        const loadData = async () => {
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

                setEntity(selectedEntity)

                const [
                    customerList,
                    accountList,
                ] = await Promise.all([
                    getCustomers(
                        selectedEntity.id,
                    ),

                    getAccounts(
                        selectedEntity.id,
                    ),
                ])

                setCustomers(
                    customerList ?? [],
                )

                setAccounts(
                    accountList ?? [],
                )
            } catch (exception) {
                console.error(
                    'Error cargando formulario:',
                    exception,
                )

                setError(
                    'No fue posible cargar los clientes y las cuentas contables.',
                )
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const incomeAccounts =
        useMemo(() => {
            return accounts.filter(
                (account) =>
                    account.active &&
                    account.allowsEntries &&
                    account.type === 'INCOME',
            )
        }, [accounts])

    const receiptAccounts =
        useMemo(() => {
            return accounts.filter(
                (account) =>
                    account.active &&
                    account.allowsEntries &&
                    account.type === 'ASSET',
            )
        }, [accounts])

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        if (!entity) {
            setError(
                'No existe una entidad contable seleccionada.',
            )

            return
        }

        if (
            !incomeDate ||
            !description.trim() ||
            !amount ||
            !incomeAccountId ||
            !receiptAccountId
        ) {
            setError(
                'Completa todos los campos obligatorios.',
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
                'El monto debe ser mayor que cero.',
            )

            return
        }

        try {
            setSaving(true)
            setError('')

            await createIncome(
                entity.id,
                {
                    customerId:
                        customerId || null,

                    incomeDate,

                    description:
                        description.trim(),

                    reference:
                        reference.trim()
                            ? reference.trim()
                            : null,

                    amount:
                    numericAmount,

                    incomeAccountId,

                    receiptAccountId,
                },
            )

            navigate(
                '/ingresos',
                {
                    replace: true,
                },
            )
        } catch (exception) {
            console.error(
                'Error guardando ingreso:',
                exception,
            )

            setError(
                'No fue posible guardar el ingreso. Revisa los datos e inténtalo nuevamente.',
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
                        className="mx-auto animate-spin text-emerald-400"
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

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

                <div>

                    <p className="text-sm font-semibold text-emerald-400">
                        Gestión financiera
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Nuevo ingreso
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                        {entity
                            ? `Registra un ingreso para ${entity.displayName}.`
                            : 'Registra una nueva operación de ingreso.'}

                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate('/ingresos')
                    }
                    className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                    Volver a Ingresos
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
                onSubmit={handleSubmit}
                className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]"
            >

                <div className="border-b border-slate-800 px-6 py-5">

                    <h3 className="font-bold">
                        Información del ingreso
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Completa los datos de la operación.
                    </p>

                </div>

                <div className="grid gap-6 p-6 md:grid-cols-2">

                    {/* FECHA */}

                    <div>

                        <label
                            htmlFor="incomeDate"
                            className="mb-2 block text-sm font-semibold text-slate-300"
                        >
                            Fecha *
                        </label>

                        <div className="relative">

                            <CalendarDays
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                id="incomeDate"
                                type="date"
                                value={incomeDate}
                                onChange={(event) =>
                                    setIncomeDate(
                                        event.target.value,
                                    )
                                }
                                required
                                className="w-full rounded-xl border border-slate-700 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-emerald-500/50"
                            />

                        </div>

                    </div>

                    {/* MONTO */}

                    <div>

                        <label
                            htmlFor="amount"
                            className="mb-2 block text-sm font-semibold text-slate-300"
                        >
                            Monto *
                        </label>

                        <div className="relative">

                            <DollarSign
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                id="amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(
                                        event.target.value,
                                    )
                                }
                                placeholder="0.00"
                                required
                                className="w-full rounded-xl border border-slate-700 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
                            />

                        </div>

                    </div>

                    {/* DESCRIPCIÓN */}

                    <div className="md:col-span-2">

                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-semibold text-slate-300"
                        >
                            Descripción *
                        </label>

                        <div className="relative">

                            <FileText
                                size={17}
                                className="absolute left-4 top-3.5 text-slate-500"
                            />

                            <textarea
                                id="description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value,
                                    )
                                }
                                placeholder="Ejemplo: Pago por servicio de desarrollo web"
                                required
                                rows={3}
                                className="w-full resize-none rounded-xl border border-slate-700 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
                            />

                        </div>

                    </div>

                    {/* REFERENCIA */}

                    <div className="md:col-span-2">

                        <label
                            htmlFor="reference"
                            className="mb-2 block text-sm font-semibold text-slate-300"
                        >
                            Referencia

                            <span className="ml-2 text-xs font-normal text-slate-600">
                Opcional
              </span>
                        </label>

                        <input
                            id="reference"
                            type="text"
                            value={reference}
                            onChange={(event) =>
                                setReference(
                                    event.target.value,
                                )
                            }
                            placeholder="Ejemplo: FACT-001"
                            className="w-full rounded-xl border border-slate-700 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
                        />

                    </div>

                    {/* CLIENTE */}

                    <div>

                        <label
                            htmlFor="customer"
                            className="mb-2 block text-sm font-semibold text-slate-300"
                        >
                            Cliente
                        </label>

                        <div className="relative">

                            <UserRound
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <select
                                id="customer"
                                value={customerId}
                                onChange={(event) =>
                                    setCustomerId(
                                        event.target.value,
                                    )
                                }
                                className="w-full appearance-none rounded-xl border border-slate-700 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-emerald-500/50"
                            >

                                <option value="">
                                    Sin cliente
                                </option>

                                {customers
                                    .filter(
                                        (customer) =>
                                            customer.active,
                                    )
                                    .map(
                                        (customer) => (
                                            <option
                                                key={customer.id}
                                                value={customer.id}
                                            >
                                                {customer.displayName}
                                            </option>
                                        ),
                                    )}

                            </select>

                        </div>

                    </div>

                    {/* CUENTA INGRESO */}

                    <div>

                        <label
                            htmlFor="incomeAccount"
                            className="mb-2 block text-sm font-semibold text-slate-300"
                        >
                            Cuenta de ingreso *
                        </label>

                        <div className="relative">

                            <WalletCards
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <select
                                id="incomeAccount"
                                value={incomeAccountId}
                                onChange={(event) =>
                                    setIncomeAccountId(
                                        event.target.value,
                                    )
                                }
                                required
                                className="w-full appearance-none rounded-xl border border-slate-700 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-emerald-500/50"
                            >

                                <option value="">
                                    Selecciona una cuenta
                                </option>

                                {incomeAccounts.map(
                                    (account) => (
                                        <option
                                            key={account.id}
                                            value={account.id}
                                        >
                                            {account.code} - {account.name}
                                        </option>
                                    ),
                                )}

                            </select>

                        </div>

                    </div>

                    {/* CUENTA DE RECEPCIÓN */}

                    <div className="md:col-span-2">

                        <label
                            htmlFor="receiptAccount"
                            className="mb-2 block text-sm font-semibold text-slate-300"
                        >
                            Cuenta donde ingresa el dinero *
                        </label>

                        <div className="relative">

                            <WalletCards
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <select
                                id="receiptAccount"
                                value={receiptAccountId}
                                onChange={(event) =>
                                    setReceiptAccountId(
                                        event.target.value,
                                    )
                                }
                                required
                                className="w-full appearance-none rounded-xl border border-slate-700 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-emerald-500/50"
                            >

                                <option value="">
                                    Selecciona dónde recibiste el dinero
                                </option>

                                {receiptAccounts.map(
                                    (account) => (
                                        <option
                                            key={account.id}
                                            value={account.id}
                                        >
                                            {account.code} - {account.name}
                                        </option>
                                    ),
                                )}

                            </select>

                        </div>

                    </div>

                </div>

                {/* BOTONES */}

                <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-5">

                    <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                            navigate('/ingresos')
                        }
                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#02140d] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {saving ? (
                            <LoaderCircle
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Save size={17} />
                        )}

                        {saving
                            ? 'Guardando...'
                            : 'Guardar ingreso'}

                    </button>

                </div>

            </form>

        </section>
    )
}

export default NewIncomePage