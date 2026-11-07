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
    getCustomers,
    type Customer,
} from '../services/customerService'

import {
    getAccounts,
    type Account,
} from '../services/accountService'

import {
    createObligation,
} from '../services/obligationService'

function NewReceivablePage() {
    const navigate = useNavigate()

    const [entity, setEntity] =
        useState<AccountingEntity | null>(null)

    const [customers, setCustomers] =
        useState<Customer[]>([])

    const [accounts, setAccounts] =
        useState<Account[]>([])

    const [customerId, setCustomerId] =
        useState('')

    const [issueDate, setIssueDate] =
        useState('')

    const [dueDate, setDueDate] =
        useState('')

    const [description, setDescription] =
        useState('')

    const [reference, setReference] =
        useState('')

    const [totalAmount, setTotalAmount] =
        useState('')

    const [
        obligationAccountId,
        setObligationAccountId,
    ] = useState('')

    const [
        counterpartAccountId,
        setCounterpartAccountId,
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
                    customerList.filter(
                        (item) => item.active,
                    ),
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

    /*
     * CUENTAS POR COBRAR
     * Deben ser cuentas ASSET.
     */

    const receivableAccounts =
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

    /*
     * CONTRAPARTIDA
     * El backend exige INCOME.
     */

    const incomeAccounts =
        useMemo(
            () =>
                accounts.filter(
                    (account) =>
                        account.active &&
                        account.allowsEntries &&
                        account.type === 'INCOME',
                ),
            [accounts],
        )

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
            !customerId ||
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

        if (dueDate < issueDate) {
            setError(
                'La fecha de vencimiento no puede ser anterior a la fecha de emisión.',
            )
            return
        }

        const numericAmount =
            Number(totalAmount)

        if (
            Number.isNaN(numericAmount) ||
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

            await createObligation(
                entity.id,
                {
                    type: 'RECEIVABLE',

                    customerId,

                    supplierId: null,

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

            navigate(
                '/cuentas-por-cobrar',
                {
                    replace: true,
                },
            )
        } catch (exception) {
            console.error(
                'Error creando cuenta por cobrar:',
                exception,
            )

            setError(
                'No fue posible registrar la cuenta por cobrar. Revisa los datos e inténtalo nuevamente.',
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
                        Cargando formulario...
                    </p>

                </div>

            </div>
        )
    }

    return (
        <section className="px-6 py-7 xl:px-8">

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                <div>
                    <p className="text-sm font-semibold text-blue-400">
                        Gestión financiera
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Nueva cuenta por cobrar
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Registra un valor pendiente de cobro de un cliente.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/cuentas-por-cobrar',
                        )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
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

            <form
                onSubmit={handleSubmit}
                className="mt-7 rounded-2xl border border-slate-800 bg-[#071329] p-6"
            >

                <div className="grid gap-6 md:grid-cols-2">

                    <div>
                        <label className="text-sm font-semibold text-slate-300">
                            Cliente *
                        </label>

                        <select
                            value={customerId}
                            onChange={(event) =>
                                setCustomerId(
                                    event.target.value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                        >
                            <option value="">
                                Selecciona un cliente
                            </option>

                            {customers.map(
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

                    <div>
                        <label className="text-sm font-semibold text-slate-300">
                            Valor total *
                        </label>

                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={totalAmount}
                            onChange={(event) =>
                                setTotalAmount(
                                    event.target.value,
                                )
                            }
                            placeholder="0.00"
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-300">
                            Fecha de emisión *
                        </label>

                        <input
                            type="date"
                            value={issueDate}
                            onChange={(event) =>
                                setIssueDate(
                                    event.target.value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-300">
                            Fecha de vencimiento *
                        </label>

                        <input
                            type="date"
                            value={dueDate}
                            onChange={(event) =>
                                setDueDate(
                                    event.target.value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-slate-300">
                            Descripción *
                        </label>

                        <input
                            type="text"
                            maxLength={255}
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value,
                                )
                            }
                            placeholder="Ej. Venta a crédito"
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-300">
                            Referencia
                        </label>

                        <input
                            type="text"
                            maxLength={100}
                            value={reference}
                            onChange={(event) =>
                                setReference(
                                    event.target.value,
                                )
                            }
                            placeholder="Ej. FAC-001"
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-300">
                            Cuenta por cobrar *
                        </label>

                        <select
                            value={obligationAccountId}
                            onChange={(event) =>
                                setObligationAccountId(
                                    event.target.value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                        >
                            <option value="">
                                Selecciona una cuenta
                            </option>

                            {receivableAccounts.map(
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

                    <div>
                        <label className="text-sm font-semibold text-slate-300">
                            Cuenta de ingreso *
                        </label>

                        <select
                            value={counterpartAccountId}
                            onChange={(event) =>
                                setCounterpartAccountId(
                                    event.target.value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
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

                <div className="mt-8 flex justify-end gap-3">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/cuentas-por-cobrar',
                            )
                        }
                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? (
                            <LoaderCircle
                                size={18}
                                className="animate-spin"
                            />
                        ) : (
                            <Save size={18} />
                        )}

                        {saving
                            ? 'Guardando...'
                            : 'Guardar cuenta por cobrar'}
                    </button>

                </div>

            </form>

        </section>
    )
}

export default NewReceivablePage