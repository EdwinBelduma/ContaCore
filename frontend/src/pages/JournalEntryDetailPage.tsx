import {
    ArrowLeft,
    BookOpenText,
    CalendarDays,
    FileText,
    LoaderCircle,
    ReceiptText,
} from 'lucide-react'

import {
    useEffect,
    useMemo,
    useState,
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
    getJournalEntryById,
    type JournalEntry,
} from '../services/journalEntryService'

function JournalEntryDetailPage() {
    const navigate =
        useNavigate()

    const {
        journalEntryId,
    } = useParams()

    const [entity, setEntity] =
        useState<AccountingEntity | null>(
            null,
        )

    const [entry, setEntry] =
        useState<JournalEntry | null>(
            null,
        )

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                setError('')

                if (
                    !journalEntryId
                ) {
                    setError(
                        'No se encontró el identificador del asiento contable.',
                    )
                    return
                }

                const entities =
                    await getAccountingEntities()

                if (
                    entities.length ===
                    0
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
                    ) ?? entities[0]

                setEntity(
                    selectedEntity,
                )

                const entryData =
                    await getJournalEntryById(
                        selectedEntity.id,
                        journalEntryId,
                    )

                setEntry(
                    entryData,
                )
            } catch (exception) {
                console.error(
                    'Error cargando asiento contable:',
                    exception,
                )

                setError(
                    'No fue posible cargar el asiento contable.',
                )
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [journalEntryId])

    const calculatedDebit =
        useMemo(
            () =>
                entry?.lines?.reduce(
                    (
                        total,
                        line,
                    ) =>
                        total +
                        Number(
                            line.debit ??
                            0,
                        ),
                    0,
                ) ?? 0,
            [entry],
        )

    const calculatedCredit =
        useMemo(
            () =>
                entry?.lines?.reduce(
                    (
                        total,
                        line,
                    ) =>
                        total +
                        Number(
                            line.credit ??
                            0,
                        ),
                    0,
                ) ?? 0,
            [entry],
        )

    const totalDebit =
        entry &&
        Number.isFinite(
            Number(
                entry.totalDebit,
            ),
        )
            ? Number(
                entry.totalDebit,
            )
            : calculatedDebit

    const totalCredit =
        entry &&
        Number.isFinite(
            Number(
                entry.totalCredit,
            ),
        )
            ? Number(
                entry.totalCredit,
            )
            : calculatedCredit

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
        status: string,
    ) => {
        switch (status) {
            case 'POSTED':
                return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'

            case 'DRAFT':
                return 'border-amber-400/20 bg-amber-500/10 text-amber-300'

            case 'VOIDED':
                return 'border-rose-400/20 bg-rose-500/10 text-rose-300'

            default:
                return 'border-slate-600 bg-slate-800 text-slate-300'
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
                        Cargando asiento contable...
                    </p>
                </div>
            </div>
        )
    }

    if (
        error &&
        !entry
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
                            '/asientos',
                        )
                    }
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-400"
                >
                    <ArrowLeft
                        size={17}
                    />

                    Volver
                </button>
            </section>
        )
    }

    if (!entry) {
        return null
    }

    return (
        <section className="px-6 py-7 xl:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold text-blue-400">
                        Contabilidad
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Detalle del asiento
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Consulta la información y los movimientos del asiento contable.
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

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-5">
                    <div className="flex items-start gap-3">
                        <CalendarDays
                            size={21}
                            className="mt-1 text-blue-400"
                        />

                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500">
                                Fecha
                            </p>

                            <p className="mt-2 font-bold">
                                {formatDate(
                                    entry.entryDate,
                                )}
                            </p>
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-5">
                    <div className="flex items-start gap-3">
                        <FileText
                            size={21}
                            className="mt-1 text-blue-400"
                        />

                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500">
                                Referencia
                            </p>

                            <p className="mt-2 font-bold">
                                {entry.reference ||
                                    'Sin referencia'}
                            </p>
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-5">
                    <div className="flex items-start gap-3">
                        <BookOpenText
                            size={21}
                            className="mt-1 text-blue-400"
                        />

                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500">
                                Estado
                            </p>

                            <span
                                className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                                    entry.status,
                                )}`}
                            >
                {getStatusLabel(
                    entry.status,
                )}
              </span>
                        </div>
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-5">
                    <div className="flex items-start gap-3">
                        <ReceiptText
                            size={21}
                            className="mt-1 text-blue-400"
                        />

                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500">
                                Movimientos
                            </p>

                            <p className="mt-2 text-2xl font-black">
                                {entry.lines?.length ??
                                    0}
                            </p>
                        </div>
                    </div>
                </article>
            </div>

            <article className="mt-6 rounded-2xl border border-slate-800 bg-[#071329] p-6">
                <p className="text-xs font-bold uppercase text-slate-500">
                    Descripción
                </p>

                <p className="mt-2 text-base font-semibold text-slate-200">
                    {entry.description}
                </p>

                {entity && (
                    <p className="mt-3 text-xs text-slate-500">
                        Entidad:{' '}
                        {entity.displayName}
                    </p>
                )}
            </article>

            <article className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">
                <div className="border-b border-slate-800 px-6 py-5">
                    <h3 className="font-bold">
                        Movimientos contables
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Detalle de las cuentas afectadas por este asiento.
                    </p>
                </div>

                {!entry.lines ||
                entry.lines.length ===
                0 ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                        Este asiento no tiene movimientos disponibles.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                            <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase text-slate-500">
                                <th className="px-6 py-4">
                                    #
                                </th>

                                <th className="px-6 py-4">
                                    Cuenta
                                </th>

                                <th className="px-6 py-4">
                                    Descripción
                                </th>

                                <th className="px-6 py-4 text-right">
                                    Debe
                                </th>

                                <th className="px-6 py-4 text-right">
                                    Haber
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {entry.lines.map(
                                (
                                    line,
                                    index,
                                ) => (
                                    <tr
                                        key={
                                            line.id ??
                                            `${line.accountId}-${index}`
                                        }
                                        className="border-b border-slate-800/80 last:border-b-0"
                                    >
                                        <td className="px-6 py-5 text-sm text-slate-500">
                                            {line.lineNumber ??
                                                index +
                                                1}
                                        </td>

                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-200">
                                                {line.accountCode}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {line.accountName}
                                            </p>
                                        </td>

                                        <td className="px-6 py-5 text-sm text-slate-300">
                                            {line.description ||
                                                '-'}
                                        </td>

                                        <td className="px-6 py-5 text-right font-semibold text-emerald-300">
                                            {Number(
                                                line.debit,
                                            ) >
                                            0
                                                ? formatCurrency(
                                                    line.debit,
                                                )
                                                : '-'}
                                        </td>

                                        <td className="px-6 py-5 text-right font-semibold text-blue-300">
                                            {Number(
                                                line.credit,
                                            ) >
                                            0
                                                ? formatCurrency(
                                                    line.credit,
                                                )
                                                : '-'}
                                        </td>
                                    </tr>
                                ),
                            )}
                            </tbody>

                            <tfoot>
                            <tr className="border-t border-slate-700 bg-slate-900/40">
                                <td
                                    colSpan={3}
                                    className="px-6 py-5 text-right text-sm font-black uppercase text-slate-300"
                                >
                                    Totales
                                </td>

                                <td className="px-6 py-5 text-right text-lg font-black text-emerald-300">
                                    {formatCurrency(
                                        totalDebit,
                                    )}
                                </td>

                                <td className="px-6 py-5 text-right text-lg font-black text-blue-300">
                                    {formatCurrency(
                                        totalCredit,
                                    )}
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </article>

            <div
                className={`mt-6 rounded-2xl border p-5 ${
                    Math.abs(
                        totalDebit -
                        totalCredit,
                    ) < 0.005 &&
                    totalDebit > 0
                        ? 'border-emerald-400/20 bg-emerald-500/10'
                        : 'border-amber-400/20 bg-amber-500/10'
                }`}
            >
                {Math.abs(
                    totalDebit -
                    totalCredit,
                ) < 0.005 &&
                totalDebit > 0 ? (
                    <p className="font-bold text-emerald-300">
                        ✓ El asiento está balanceado. Total Debe y Total Haber son iguales.
                    </p>
                ) : (
                    <p className="font-bold text-amber-300">
                        Atención: el asiento presenta una diferencia entre Debe y Haber.
                    </p>
                )}
            </div>
        </section>
    )
}

export default JournalEntryDetailPage