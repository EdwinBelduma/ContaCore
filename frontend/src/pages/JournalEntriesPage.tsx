import {
    BookOpenText,
    CheckCircle2,
    Eye,
    FileText,
    Plus,
    Search,
    WalletCards,
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
    getJournalEntries,
    type JournalEntry,
} from '../services/journalEntryService'

function JournalEntriesPage() {
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
        entries,
        setEntries,
    ] =
        useState<JournalEntry[]>([])

    const [
        search,
        setSearch,
    ] =
        useState('')

    const [
        loading,
        setLoading,
    ] =
        useState(true)

    const [
        error,
        setError,
    ] =
        useState('')

    /*
     * CARGAR ASIENTOS
     */

    useEffect(() => {
        const loadData =
            async () => {
                try {
                    setLoading(true)
                    setError('')

                    /*
                     * OBTENER ENTIDAD
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
                     * OBTENER ASIENTOS
                     */

                    const journalEntries =
                        await getJournalEntries(
                            selectedEntity.id,
                        )

                    setEntries(
                        journalEntries ??
                        [],
                    )
                } catch (
                    exception
                    ) {
                    console.error(
                        'Error cargando asientos contables:',
                        exception,
                    )

                    setError(
                        'No fue posible cargar los asientos contables.',
                    )
                } finally {
                    setLoading(false)
                }
            }

        loadData()
    }, [])

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

    /*
     * COLOR DEL ESTADO
     */

    const getStatusClass =
        (
            status: string,
        ) => {
            switch (status) {
                case 'POSTED':
                    return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'

                case 'VOIDED':
                    return 'border-rose-400/20 bg-rose-500/10 text-rose-300'

                default:
                    return 'border-amber-400/20 bg-amber-500/10 text-amber-300'
            }
        }

    /*
     * BUSCADOR
     */

    const filteredEntries =
        useMemo(
            () => {
                const normalizedSearch =
                    search
                        .trim()
                        .toLowerCase()

                if (
                    !normalizedSearch
                ) {
                    return entries
                }

                return entries.filter(
                    (
                        entry,
                    ) => {
                        const searchableText =
                            [
                                entry.description,
                                entry.reference,
                                entry.status,
                                entry.entryDate,
                            ]
                                .filter(
                                    Boolean,
                                )
                                .join(' ')
                                .toLowerCase()

                        return searchableText.includes(
                            normalizedSearch,
                        )
                    },
                )
            },
            [
                entries,
                search,
            ],
        )

    /*
     * TOTAL ASIENTOS
     */

    const totalEntries =
        entries.length

    /*
     * CONTABILIZADOS
     */

    const postedEntries =
        useMemo(
            () =>
                entries.filter(
                    (entry) =>
                        entry.status ===
                        'POSTED',
                ).length,
            [
                entries,
            ],
        )

    /*
     * TOTAL MOVIMIENTO
     */

    const totalMovement =
        useMemo(
            () =>
                entries
                    .filter(
                        (entry) =>
                            entry.status ===
                            'POSTED',
                    )
                    .reduce(
                        (
                            total,
                            entry,
                        ) =>
                            total +
                            Number(
                                entry.totalDebit,
                            ),
                        0,
                    ),
            [
                entries,
            ],
        )

    /*
     * CARGANDO
     */

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando asientos contables...
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

                    <p className="text-sm font-semibold text-blue-400">
                        Contabilidad
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Asientos contables
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        {entity
                            ? `Movimientos contables registrados en ${entity.displayName}.`
                            : 'Consulta los movimientos registrados en la contabilidad.'}
                    </p>

                </div>

                {/* NUEVO ASIENTO */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/asientos/nuevo',
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500"
                >

                    <Plus
                        size={18}
                    />

                    Nuevo asiento

                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* TARJETAS */}

            <div className="mt-8 grid gap-5 md:grid-cols-3">

                {/* TOTAL */}

                <article className="rounded-2xl border border-blue-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Total asientos
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {totalEntries}
                            </p>

                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                            <BookOpenText
                                size={26}
                            />

                        </div>

                    </div>

                </article>

                {/* CONTABILIZADOS */}

                <article className="rounded-2xl border border-emerald-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Contabilizados
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {postedEntries}
                            </p>

                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">

                            <CheckCircle2
                                size={26}
                            />

                        </div>

                    </div>

                </article>

                {/* MOVIMIENTO */}

                <article className="rounded-2xl border border-violet-400/20 bg-[#071329] p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                Movimiento contabilizado
                            </p>

                            <p className="mt-3 text-3xl font-black">
                                {formatCurrency(
                                    totalMovement,
                                )}
                            </p>

                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">

                            <WalletCards
                                size={26}
                            />

                        </div>

                    </div>

                </article>

            </div>

            {/* TABLA */}

            <article className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">

                {/* CABECERA DE TABLA */}

                <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <h3 className="font-bold">
                            Asientos registrados
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Historial de movimientos contables.
                        </p>

                    </div>

                    {/* BUSCADOR */}

                    <div className="relative w-full lg:w-80">

                        <Search
                            size={18}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="text"
                            value={
                                search
                            }
                            onChange={(
                                event,
                            ) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Buscar asiento..."
                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                        />

                    </div>

                </div>

                {/* SIN ASIENTOS */}

                {entries.length ===
                0 ? (
                    <div className="px-6 py-16 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                            <BookOpenText
                                size={28}
                            />

                        </div>

                        <h3 className="mt-5 text-lg font-bold">
                            No hay asientos contables
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Cuando registres movimientos contables aparecerán en esta sección.
                        </p>

                    </div>
                ) : filteredEntries.length ===
                0 ? (
                    <div className="px-6 py-14 text-center">

                        <Search
                            size={30}
                            className="mx-auto text-slate-600"
                        />

                        <p className="mt-4 font-semibold">
                            No se encontraron asientos
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Intenta utilizar otro término de búsqueda.
                        </p>

                    </div>
                ) : (

                    /* LISTADO */

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px]">

                            <thead>

                            <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                                <th className="px-6 py-4">
                                    Fecha
                                </th>

                                <th className="px-6 py-4">
                                    Descripción
                                </th>

                                <th className="px-6 py-4">
                                    Referencia
                                </th>

                                <th className="px-6 py-4 text-center">
                                    Movimientos
                                </th>

                                <th className="px-6 py-4 text-right">
                                    Debe
                                </th>

                                <th className="px-6 py-4 text-right">
                                    Haber
                                </th>

                                <th className="px-6 py-4">
                                    Estado
                                </th>

                                <th className="px-6 py-4 text-right">
                                    Acciones
                                </th>

                            </tr>

                            </thead>

                            <tbody>

                            {filteredEntries.map(
                                (
                                    entry,
                                ) => (
                                    <tr
                                        key={
                                            entry.id
                                        }
                                        className="border-b border-slate-800/80 transition last:border-b-0 hover:bg-slate-800/20"
                                    >

                                        {/* FECHA */}

                                        <td className="px-6 py-5 text-sm text-slate-300">

                                            {formatDate(
                                                entry.entryDate,
                                            )}

                                        </td>

                                        {/* DESCRIPCIÓN */}

                                        <td className="px-6 py-5">

                                            <div className="flex items-start gap-3">

                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">

                                                    <FileText
                                                        size={17}
                                                    />

                                                </div>

                                                <div>

                                                    <p className="font-semibold text-white">
                                                        {
                                                            entry.description
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* REFERENCIA */}

                                        <td className="px-6 py-5 text-sm text-slate-400">

                                            {entry.reference ||
                                                'Sin referencia'}

                                        </td>

                                        {/* LÍNEAS */}

                                        <td className="px-6 py-5 text-center text-sm text-slate-300">

                                            {
                                                entry.lines?.length ??
                                                0
                                            }

                                        </td>

                                        {/* DEBE */}

                                        <td className="px-6 py-5 text-right text-sm font-semibold text-blue-300">

                                            {formatCurrency(
                                                Number(
                                                    entry.totalDebit,
                                                ),
                                            )}

                                        </td>

                                        {/* HABER */}

                                        <td className="px-6 py-5 text-right text-sm font-semibold text-violet-300">

                                            {formatCurrency(
                                                Number(
                                                    entry.totalCredit,
                                                ),
                                            )}

                                        </td>

                                        {/* ESTADO */}

                                        <td className="px-6 py-5">

                        <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                entry.status,
                            )}`}
                        >
                          {getStatusLabel(
                              entry.status,
                          )}
                        </span>

                                        </td>

                                        {/* ACCIONES */}

                                        <td className="px-6 py-5 text-right">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/asientos/${entry.id}`,
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                                            >

                                                <Eye
                                                    size={15}
                                                />

                                                Ver detalle

                                            </button>

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

export default JournalEntriesPage