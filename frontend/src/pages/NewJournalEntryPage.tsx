import {
    ArrowLeft,
    BookOpenText,
    CirclePlus,
    LoaderCircle,
    Save,
    Trash2,
} from 'lucide-react'

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
} from 'react'

import { useNavigate } from 'react-router-dom'

import {
    getAccountingEntities,
    type AccountingEntity,
} from '../services/accountingEntityService'

import {
    getAccounts,
    type Account,
} from '../services/accountService'

import {
    createJournalEntry,
} from '../services/journalEntryService'

interface JournalLineForm {
    key: number
    accountId: string
    description: string
    debit: string
    credit: string
}

function getToday() {
    const now = new Date()

    const year = now.getFullYear()
    const month = String(
        now.getMonth() + 1,
    ).padStart(2, '0')
    const day = String(
        now.getDate(),
    ).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function NewJournalEntryPage() {
    const navigate = useNavigate()

    const nextLineKey = useRef(3)

    const [entity, setEntity] =
        useState<AccountingEntity | null>(null)

    const [accounts, setAccounts] =
        useState<Account[]>([])

    const [entryDate, setEntryDate] =
        useState(getToday())

    const [description, setDescription] =
        useState('')

    const [reference, setReference] =
        useState('')

    const [lines, setLines] =
        useState<JournalLineForm[]>([
            {
                key: 1,
                accountId: '',
                description: '',
                debit: '',
                credit: '',
            },
            {
                key: 2,
                accountId: '',
                description: '',
                debit: '',
                credit: '',
            },
        ])

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

                const accountList =
                    await getAccounts(
                        selectedEntity.id,
                    )

                setAccounts(
                    accountList ?? [],
                )
            } catch (exception) {
                console.error(
                    'Error cargando datos del asiento:',
                    exception,
                )

                setError(
                    'No fue posible cargar los datos necesarios.',
                )
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const availableAccounts =
        useMemo(
            () =>
                accounts
                    .filter(
                        (account) =>
                            account.active &&
                            account.allowsEntries,
                    )
                    .sort((a, b) =>
                        a.code.localeCompare(
                            b.code,
                            undefined,
                            {
                                numeric: true,
                            },
                        ),
                    ),
            [accounts],
        )

    const totalDebit =
        useMemo(
            () =>
                lines.reduce(
                    (total, line) =>
                        total +
                        (
                            Number(
                                line.debit,
                            ) || 0
                        ),
                    0,
                ),
            [lines],
        )

    const totalCredit =
        useMemo(
            () =>
                lines.reduce(
                    (total, line) =>
                        total +
                        (
                            Number(
                                line.credit,
                            ) || 0
                        ),
                    0,
                ),
            [lines],
        )

    const difference =
        Math.abs(
            totalDebit -
            totalCredit,
        )

    const balanced =
        totalDebit > 0 &&
        totalCredit > 0 &&
        difference < 0.005

    const formatCurrency = (
        value: number,
    ) =>
        new Intl.NumberFormat(
            'en-US',
            {
                style: 'currency',
                currency: 'USD',
            },
        ).format(value)

    const updateLine = (
        key: number,
        field:
            | 'accountId'
            | 'description'
            | 'debit'
            | 'credit',
        value: string,
    ) => {
        setLines(
            (currentLines) =>
                currentLines.map(
                    (line) => {
                        if (
                            line.key !== key
                        ) {
                            return line
                        }

                        if (
                            field === 'debit'
                        ) {
                            return {
                                ...line,
                                debit: value,
                                credit:
                                    Number(value) > 0
                                        ? ''
                                        : line.credit,
                            }
                        }

                        if (
                            field === 'credit'
                        ) {
                            return {
                                ...line,
                                credit: value,
                                debit:
                                    Number(value) > 0
                                        ? ''
                                        : line.debit,
                            }
                        }

                        return {
                            ...line,
                            [field]: value,
                        }
                    },
                ),
        )
    }

    const addLine = () => {
        const newKey =
            nextLineKey.current

        nextLineKey.current += 1

        setLines(
            (currentLines) => [
                ...currentLines,
                {
                    key: newKey,
                    accountId: '',
                    description: '',
                    debit: '',
                    credit: '',
                },
            ],
        )
    }

    const removeLine = (
        key: number,
    ) => {
        if (lines.length <= 2) {
            setError(
                'Un asiento debe tener al menos dos movimientos.',
            )
            return
        }

        setError('')

        setLines(
            (currentLines) =>
                currentLines.filter(
                    (line) =>
                        line.key !== key,
                ),
        )
    }

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

        if (!entryDate) {
            setError(
                'Selecciona la fecha del asiento.',
            )
            return
        }

        if (
            !description.trim()
        ) {
            setError(
                'Ingresa una descripción para el asiento.',
            )
            return
        }

        if (lines.length < 2) {
            setError(
                'El asiento debe contener al menos dos movimientos.',
            )
            return
        }

        for (
            let index = 0;
            index < lines.length;
            index += 1
        ) {
            const line =
                lines[index]

            if (!line.accountId) {
                setError(
                    `Selecciona una cuenta en el movimiento ${index + 1}.`,
                )
                return
            }

            const debit =
                Number(
                    line.debit,
                ) || 0

            const credit =
                Number(
                    line.credit,
                ) || 0

            if (
                debit < 0 ||
                credit < 0
            ) {
                setError(
                    `Los valores del movimiento ${index + 1} no pueden ser negativos.`,
                )
                return
            }

            if (
                debit === 0 &&
                credit === 0
            ) {
                setError(
                    `Ingresa Debe o Haber en el movimiento ${index + 1}.`,
                )
                return
            }

            if (
                debit > 0 &&
                credit > 0
            ) {
                setError(
                    `El movimiento ${index + 1} no puede tener Debe y Haber al mismo tiempo.`,
                )
                return
            }
        }

        if (
            totalDebit <= 0 ||
            totalCredit <= 0
        ) {
            setError(
                'El asiento debe tener movimientos en Debe y Haber.',
            )
            return
        }

        if (!balanced) {
            setError(
                `El asiento no está balanceado. Debe: ${formatCurrency(
                    totalDebit,
                )} - Haber: ${formatCurrency(
                    totalCredit,
                )}.`,
            )
            return
        }

        try {
            setSaving(true)
            setError('')

            const created =
                await createJournalEntry(
                    entity.id,
                    {
                        entryDate,

                        description:
                            description.trim(),

                        reference:
                            reference.trim()
                                ? reference.trim()
                                : null,

                        lines:
                            lines.map(
                                (line) => ({
                                    accountId:
                                    line.accountId,

                                    description:
                                        line.description
                                            .trim()
                                            ? line.description.trim()
                                            : null,

                                    debit:
                                        Number(
                                            line.debit,
                                        ) || 0,

                                    credit:
                                        Number(
                                            line.credit,
                                        ) || 0,
                                }),
                            ),
                    },
                )

            navigate(
                `/asientos/${created.id}`,
            )
        } catch (exception) {
            console.error(
                'Error creando asiento:',
                exception,
            )

            setError(
                'No fue posible registrar el asiento contable.',
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
                        Cargando cuentas contables...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <section className="px-6 py-7 xl:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold text-blue-400">
                        Contabilidad
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Nuevo asiento contable
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Registra manualmente un movimiento contable balanceado.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/asientos',
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

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            <form
                onSubmit={
                    handleSubmit
                }
                className="mt-7 space-y-7"
            >
                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">
                    <div className="flex items-center gap-3">
                        <BookOpenText
                            className="text-blue-400"
                            size={22}
                        />

                        <div>
                            <h3 className="font-bold">
                                Información del asiento
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Datos generales del movimiento contable.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-3">
                        <div>
                            <label className="text-sm font-semibold text-slate-300">
                                Fecha *
                            </label>

                            <input
                                type="date"
                                value={
                                    entryDate
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setEntryDate(
                                        event.target
                                            .value,
                                    )
                                }
                                className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-300">
                                Referencia
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
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Ej. AJUSTE-001"
                                className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="text-sm font-semibold text-slate-300">
                                Descripción *
                            </label>

                            <input
                                type="text"
                                value={
                                    description
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setDescription(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Ej. Ajuste contable"
                                className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </div>
                </article>

                <article className="overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">
                    <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="font-bold">
                                Movimientos
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                El total del Debe debe ser igual al total del Haber.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                addLine
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-300 transition hover:bg-blue-500/20"
                        >
                            <CirclePlus
                                size={17}
                            />

                            Agregar línea
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px]">
                            <thead>
                            <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase text-slate-500">
                                <th className="px-5 py-4">
                                    #
                                </th>

                                <th className="px-5 py-4">
                                    Cuenta
                                </th>

                                <th className="px-5 py-4">
                                    Descripción
                                </th>

                                <th className="px-5 py-4 text-right">
                                    Debe
                                </th>

                                <th className="px-5 py-4 text-right">
                                    Haber
                                </th>

                                <th className="px-5 py-4 text-center">
                                    Acción
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {lines.map(
                                (
                                    line,
                                    index,
                                ) => (
                                    <tr
                                        key={
                                            line.key
                                        }
                                        className="border-b border-slate-800/80 last:border-b-0"
                                    >
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                                            {index +
                                                1}
                                        </td>

                                        <td className="px-5 py-4">
                                            <select
                                                value={
                                                    line.accountId
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateLine(
                                                        line.key,
                                                        'accountId',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                className="w-full min-w-[260px] rounded-xl border border-slate-800 bg-[#0a1528] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
                                            >
                                                <option value="">
                                                    Selecciona una cuenta
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
                                        </td>

                                        <td className="px-5 py-4">
                                            <input
                                                type="text"
                                                value={
                                                    line.description
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateLine(
                                                        line.key,
                                                        'description',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Detalle opcional"
                                                className="w-full min-w-[210px] rounded-xl border border-slate-800 bg-[#0a1528] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
                                            />
                                        </td>

                                        <td className="px-5 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    line.debit
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateLine(
                                                        line.key,
                                                        'debit',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="0.00"
                                                className="w-full min-w-[120px] rounded-xl border border-slate-800 bg-[#0a1528] px-3 py-2.5 text-right text-sm text-white outline-none focus:border-blue-500/50"
                                            />
                                        </td>

                                        <td className="px-5 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    line.credit
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    updateLine(
                                                        line.key,
                                                        'credit',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="0.00"
                                                className="w-full min-w-[120px] rounded-xl border border-slate-800 bg-[#0a1528] px-3 py-2.5 text-right text-sm text-white outline-none focus:border-blue-500/50"
                                            />
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeLine(
                                                        line.key,
                                                    )
                                                }
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 transition hover:bg-rose-500/20"
                                                title="Eliminar línea"
                                            >
                                                <Trash2
                                                    size={17}
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ),
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-800 px-6 py-5">
                        <div className="ml-auto grid max-w-md gap-3">
                            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Total Debe
                </span>

                                <span className="font-bold text-emerald-300">
                  {formatCurrency(
                      totalDebit,
                  )}
                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Total Haber
                </span>

                                <span className="font-bold text-blue-300">
                  {formatCurrency(
                      totalCredit,
                  )}
                </span>
                            </div>

                            <div className="border-t border-slate-800 pt-3">
                                {balanced ? (
                                    <p className="text-right text-sm font-bold text-emerald-300">
                                        ✓ Asiento balanceado
                                    </p>
                                ) : (
                                    <p className="text-right text-sm font-bold text-amber-300">
                                        Diferencia:{' '}
                                        {formatCurrency(
                                            difference,
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </article>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/asientos',
                            )
                        }
                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={
                            saving
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                            ? 'Registrando...'
                            : 'Registrar asiento'}
                    </button>
                </div>
            </form>
        </section>
    )
}

export default NewJournalEntryPage