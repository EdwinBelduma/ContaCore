import {
    BookOpenText,
    CalendarDays,
    CheckCircle2,
    FileBarChart,
    Landmark,
    LoaderCircle,
    Search,
    Scale,
} from 'lucide-react'

import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    getAccountingEntities,
    type AccountingEntity,
} from '../services/accountingEntityService'

import {
    getAccounts,
    type Account,
} from '../services/accountService'

import {
    getJournalReport,
    getLedgerReport,
    getTrialBalanceReport,
    type JournalReportResponse,
    type LedgerReportResponse,
    type TrialBalanceReportResponse,
} from '../services/reportService'

type ReportType =
    | 'JOURNAL'
    | 'LEDGER'
    | 'TRIAL_BALANCE'

function getMonthStart() {
    const now = new Date()

    const year =
        now.getFullYear()

    const month =
        String(
            now.getMonth() + 1,
        ).padStart(
            2,
            '0',
        )

    return `${year}-${month}-01`
}

function getToday() {
    const now = new Date()

    const year =
        now.getFullYear()

    const month =
        String(
            now.getMonth() + 1,
        ).padStart(
            2,
            '0',
        )

    const day =
        String(
            now.getDate(),
        ).padStart(
            2,
            '0',
        )

    return `${year}-${month}-${day}`
}

function ReportsPage() {
    const [entity, setEntity] =
        useState<AccountingEntity | null>(
            null,
        )

    const [accounts, setAccounts] =
        useState<Account[]>([])

    const [
        reportType,
        setReportType,
    ] =
        useState<ReportType>(
            'JOURNAL',
        )

    const [from, setFrom] =
        useState(
            getMonthStart(),
        )

    const [to, setTo] =
        useState(
            getToday(),
        )

    const [
        accountId,
        setAccountId,
    ] =
        useState('')

    const [
        journalReport,
        setJournalReport,
    ] =
        useState<JournalReportResponse | null>(
            null,
        )

    const [
        ledgerReport,
        setLedgerReport,
    ] =
        useState<LedgerReportResponse | null>(
            null,
        )

    const [
        trialBalanceReport,
        setTrialBalanceReport,
    ] =
        useState<TrialBalanceReportResponse | null>(
            null,
        )

    const [loading, setLoading] =
        useState(true)

    const [
        loadingReport,
        setLoadingReport,
    ] =
        useState(false)

    const [error, setError] =
        useState('')

    /* =========================================================
       CARGA INICIAL
    ========================================================= */

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                setError('')

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
                    ) ??
                    entities[0]

                setEntity(
                    selectedEntity,
                )

                const accountList =
                    await getAccounts(
                        selectedEntity.id,
                    )

                setAccounts(
                    accountList ?? [],
                )
            } catch (
                exception
                ) {
                console.error(
                    'Error cargando reportes:',
                    exception,
                )

                setError(
                    'No fue posible cargar la información para los reportes.',
                )
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    /* =========================================================
       CUENTAS DISPONIBLES
    ========================================================= */

    const availableAccounts =
        useMemo(
            () =>
                accounts
                    .filter(
                        (
                            account,
                        ) =>
                            account.active &&
                            account.allowsEntries,
                    )
                    .sort(
                        (a, b) =>
                            a.code.localeCompare(
                                b.code,
                                undefined,
                                {
                                    numeric:
                                        true,
                                },
                            ),
                    ),
            [accounts],
        )

    /* =========================================================
       FORMATOS
    ========================================================= */

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
            Number(
                value ?? 0,
            ),
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

    /* =========================================================
       CONSULTAR REPORTE
    ========================================================= */

    const handleGenerateReport =
        async () => {
            if (!entity) {
                setError(
                    'No existe una entidad contable seleccionada.',
                )
                return
            }

            if (!from || !to) {
                setError(
                    'Selecciona la fecha inicial y la fecha final.',
                )
                return
            }

            if (
                new Date(from) >
                new Date(to)
            ) {
                setError(
                    'La fecha inicial no puede ser posterior a la fecha final.',
                )
                return
            }

            if (
                reportType ===
                'LEDGER' &&
                !accountId
            ) {
                setError(
                    'Selecciona una cuenta para consultar el Libro Mayor.',
                )
                return
            }

            try {
                setLoadingReport(
                    true,
                )

                setError('')

                setJournalReport(
                    null,
                )

                setLedgerReport(
                    null,
                )

                setTrialBalanceReport(
                    null,
                )

                if (
                    reportType ===
                    'JOURNAL'
                ) {
                    const result =
                        await getJournalReport(
                            entity.id,
                            from,
                            to,
                        )

                    setJournalReport(
                        result,
                    )

                    return
                }

                if (
                    reportType ===
                    'LEDGER'
                ) {
                    const result =
                        await getLedgerReport(
                            entity.id,
                            accountId,
                            from,
                            to,
                        )

                    setLedgerReport(
                        result,
                    )

                    return
                }

                const result =
                    await getTrialBalanceReport(
                        entity.id,
                        from,
                        to,
                    )

                setTrialBalanceReport(
                    result,
                )
            } catch (
                exception
                ) {
                console.error(
                    'Error generando reporte:',
                    exception,
                )

                setError(
                    'No fue posible generar el reporte.',
                )
            } finally {
                setLoadingReport(
                    false,
                )
            }
        }

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={38}
                        className="mx-auto animate-spin text-blue-400"
                    />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando reportes...
                    </p>
                </div>
            </div>
        )
    }

    /* =========================================================
       PANTALLA
    ========================================================= */

    return (
        <section className="px-6 py-7 xl:px-8">
            {/* CABECERA */}

            <div>
                <p className="text-sm font-semibold text-blue-400">
                    Contabilidad
                </p>

                <h2 className="mt-1 text-3xl font-black">
                    Reportes contables
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                    Consulta el Libro Diario, Libro Mayor y Balanza de Comprobación de{' '}
                    {entity?.displayName ??
                        'tu entidad contable'}.
                </p>
            </div>

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* TIPOS DE REPORTE */}

            <div className="mt-7 grid gap-4 md:grid-cols-3">
                <button
                    type="button"
                    onClick={() =>
                        setReportType(
                            'JOURNAL',
                        )
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                        reportType ===
                        'JOURNAL'
                            ? 'border-blue-500/50 bg-blue-500/10'
                            : 'border-slate-800 bg-[#071329] hover:border-slate-700'
                    }`}
                >
                    <BookOpenText
                        size={25}
                        className="text-blue-400"
                    />

                    <h3 className="mt-4 font-bold">
                        Libro Diario
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Consulta todos los asientos registrados en un período.
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setReportType(
                            'LEDGER',
                        )
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                        reportType ===
                        'LEDGER'
                            ? 'border-violet-500/50 bg-violet-500/10'
                            : 'border-slate-800 bg-[#071329] hover:border-slate-700'
                    }`}
                >
                    <Landmark
                        size={25}
                        className="text-violet-400"
                    />

                    <h3 className="mt-4 font-bold">
                        Libro Mayor
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Consulta los movimientos y saldo de una cuenta específica.
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setReportType(
                            'TRIAL_BALANCE',
                        )
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                        reportType ===
                        'TRIAL_BALANCE'
                            ? 'border-emerald-500/50 bg-emerald-500/10'
                            : 'border-slate-800 bg-[#071329] hover:border-slate-700'
                    }`}
                >
                    <Scale
                        size={25}
                        className="text-emerald-400"
                    />

                    <h3 className="mt-4 font-bold">
                        Balanza de Comprobación
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Verifica los movimientos y saldos contables.
                    </p>
                </button>
            </div>

            {/* FILTROS */}

            <article className="mt-6 rounded-2xl border border-slate-800 bg-[#071329] p-6">
                <div className="flex items-center gap-3">
                    <CalendarDays
                        size={21}
                        className="text-blue-400"
                    />

                    <div>
                        <h3 className="font-bold">
                            Período del reporte
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Selecciona las fechas que deseas consultar.
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-300">
                            Desde *
                        </label>

                        <input
                            type="date"
                            value={from}
                            onChange={(
                                event,
                            ) =>
                                setFrom(
                                    event.target
                                        .value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-300">
                            Hasta *
                        </label>

                        <input
                            type="date"
                            value={to}
                            onChange={(
                                event,
                            ) =>
                                setTo(
                                    event.target
                                        .value,
                                )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                        />
                    </div>

                    {reportType ===
                        'LEDGER' && (
                            <div className="md:col-span-2">
                                <label className="text-sm font-semibold text-slate-300">
                                    Cuenta contable *
                                </label>

                                <select
                                    value={
                                        accountId
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setAccountId(
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
                            </div>
                        )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={
                            handleGenerateReport
                        }
                        disabled={
                            loadingReport
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loadingReport ? (
                            <LoaderCircle
                                size={18}
                                className="animate-spin"
                            />
                        ) : (
                            <Search
                                size={18}
                            />
                        )}

                        {loadingReport
                            ? 'Consultando...'
                            : 'Generar reporte'}
                    </button>
                </div>
            </article>

            {/* =====================================================
          LIBRO DIARIO
      ====================================================== */}

            {journalReport && (
                <article className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">
                    <div className="border-b border-slate-800 px-6 py-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-lg font-bold">
                                    Libro Diario
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {formatDate(
                                        journalReport.from,
                                    )}{' '}
                                    -{' '}
                                    {formatDate(
                                        journalReport.to,
                                    )}
                                </p>
                            </div>

                            <div className="text-sm text-slate-400">
                                {
                                    journalReport.accountingEntityName
                                }
                            </div>
                        </div>
                    </div>

                    {journalReport.entries.length ===
                    0 ? (
                        <div className="px-6 py-12 text-center text-sm text-slate-500">
                            No existen movimientos en el período seleccionado.
                        </div>
                    ) : (
                        <div>
                            {journalReport.entries.map(
                                (
                                    entry,
                                ) => (
                                    <div
                                        key={
                                            entry.id
                                        }
                                        className="border-b border-slate-800 last:border-b-0"
                                    >
                                        <div className="bg-slate-900/30 px-6 py-4">
                                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                    <p className="font-bold">
                                                        {
                                                            entry.description
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {formatDate(
                                                            entry.entryDate,
                                                        )}

                                                        {entry.reference &&
                                                            ` · ${entry.reference}`}
                                                    </p>
                                                </div>

                                                <div className="text-sm">
                          <span className="mr-5 text-emerald-300">
                            Debe:{' '}
                              {formatCurrency(
                                  entry.totalDebit,
                              )}
                          </span>

                                                    <span className="text-blue-300">
                            Haber:{' '}
                                                        {formatCurrency(
                                                            entry.totalCredit,
                                                        )}
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[700px]">
                                                <thead>
                                                <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase text-slate-500">
                                                    <th className="px-6 py-3">
                                                        Cuenta
                                                    </th>

                                                    <th className="px-6 py-3">
                                                        Descripción
                                                    </th>

                                                    <th className="px-6 py-3 text-right">
                                                        Debe
                                                    </th>

                                                    <th className="px-6 py-3 text-right">
                                                        Haber
                                                    </th>
                                                </tr>
                                                </thead>

                                                <tbody>
                                                {entry.lines.map(
                                                    (
                                                        line,
                                                    ) => (
                                                        <tr
                                                            key={`${entry.id}-${line.lineNumber}`}
                                                            className="border-b border-slate-800/50 last:border-b-0"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <p className="font-semibold">
                                                                    {
                                                                        line.accountCode
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-sm text-slate-500">
                                                                    {
                                                                        line.accountName
                                                                    }
                                                                </p>
                                                            </td>

                                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                                {line.description ??
                                                                    '-'}
                                                            </td>

                                                            <td className="px-6 py-4 text-right font-semibold text-emerald-300">
                                                                {Number(
                                                                    line.debit,
                                                                ) >
                                                                0
                                                                    ? formatCurrency(
                                                                        line.debit,
                                                                    )
                                                                    : '-'}
                                                            </td>

                                                            <td className="px-6 py-4 text-right font-semibold text-blue-300">
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
                                            </table>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    )}

                    <div className="grid gap-4 border-t border-slate-800 bg-slate-900/30 px-6 py-5 md:grid-cols-2">
                        <div>
                            <p className="text-xs uppercase text-slate-500">
                                Total Debe
                            </p>

                            <p className="mt-1 text-xl font-black text-emerald-300">
                                {formatCurrency(
                                    journalReport.totalDebit,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase text-slate-500">
                                Total Haber
                            </p>

                            <p className="mt-1 text-xl font-black text-blue-300">
                                {formatCurrency(
                                    journalReport.totalCredit,
                                )}
                            </p>
                        </div>
                    </div>
                </article>
            )}

            {/* =====================================================
          LIBRO MAYOR
      ====================================================== */}

            {ledgerReport && (
                <article className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">
                    <div className="border-b border-slate-800 px-6 py-5">
                        <h3 className="text-lg font-bold">
                            Libro Mayor
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {
                                ledgerReport.accountCode
                            }{' '}
                            -{' '}
                            {
                                ledgerReport.accountName
                            }
                        </p>
                    </div>

                    <div className="grid gap-4 border-b border-slate-800 p-6 md:grid-cols-4">
                        <div>
                            <p className="text-xs uppercase text-slate-500">
                                Saldo inicial
                            </p>

                            <p className="mt-2 text-lg font-bold">
                                {formatCurrency(
                                    ledgerReport.openingBalance,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase text-slate-500">
                                Total Debe
                            </p>

                            <p className="mt-2 text-lg font-bold text-emerald-300">
                                {formatCurrency(
                                    ledgerReport.totalDebit,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase text-slate-500">
                                Total Haber
                            </p>

                            <p className="mt-2 text-lg font-bold text-blue-300">
                                {formatCurrency(
                                    ledgerReport.totalCredit,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase text-slate-500">
                                Saldo final
                            </p>

                            <p className="mt-2 text-lg font-black text-violet-300">
                                {formatCurrency(
                                    ledgerReport.closingBalance,
                                )}
                            </p>
                        </div>
                    </div>

                    {ledgerReport.movements.length ===
                    0 ? (
                        <div className="px-6 py-12 text-center text-sm text-slate-500">
                            No existen movimientos para esta cuenta.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase text-slate-500">
                                    <th className="px-6 py-4">
                                        Fecha
                                    </th>

                                    <th className="px-6 py-4">
                                        Referencia
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

                                    <th className="px-6 py-4 text-right">
                                        Saldo
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {ledgerReport.movements.map(
                                    (
                                        movement,
                                        index,
                                    ) => (
                                        <tr
                                            key={`${movement.journalEntryId}-${index}`}
                                            className="border-b border-slate-800/70 last:border-b-0"
                                        >
                                            <td className="px-6 py-5 text-sm text-slate-300">
                                                {formatDate(
                                                    movement.entryDate,
                                                )}
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-400">
                                                {movement.reference ??
                                                    '-'}
                                            </td>

                                            <td className="px-6 py-5 text-sm">
                                                {
                                                    movement.description
                                                }
                                            </td>

                                            <td className="px-6 py-5 text-right font-semibold text-emerald-300">
                                                {Number(
                                                    movement.debit,
                                                ) >
                                                0
                                                    ? formatCurrency(
                                                        movement.debit,
                                                    )
                                                    : '-'}
                                            </td>

                                            <td className="px-6 py-5 text-right font-semibold text-blue-300">
                                                {Number(
                                                    movement.credit,
                                                ) >
                                                0
                                                    ? formatCurrency(
                                                        movement.credit,
                                                    )
                                                    : '-'}
                                            </td>

                                            <td className="px-6 py-5 text-right font-bold text-violet-300">
                                                {formatCurrency(
                                                    movement.balance,
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
            )}

            {/* =====================================================
          BALANZA
      ====================================================== */}

            {trialBalanceReport && (
                <article className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">
                    <div className="border-b border-slate-800 px-6 py-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-lg font-bold">
                                    Balanza de Comprobación
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {formatDate(
                                        trialBalanceReport.from,
                                    )}{' '}
                                    -{' '}
                                    {formatDate(
                                        trialBalanceReport.to,
                                    )}
                                </p>
                            </div>

                            {trialBalanceReport.balanced ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300">
                  <CheckCircle2
                      size={17}
                  />

                  Balanceada
                </span>
                            ) : (
                                <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-300">
                  No balanceada
                </span>
                            )}
                        </div>
                    </div>

                    {trialBalanceReport.accounts.length ===
                    0 ? (
                        <div className="px-6 py-12 text-center text-sm text-slate-500">
                            No existen cuentas con movimientos en el período.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                <tr className="border-b border-slate-800 text-left text-xs font-bold uppercase text-slate-500">
                                    <th className="px-6 py-4">
                                        Código
                                    </th>

                                    <th className="px-6 py-4">
                                        Cuenta
                                    </th>

                                    <th className="px-6 py-4">
                                        Tipo
                                    </th>

                                    <th className="px-6 py-4 text-right">
                                        Debe
                                    </th>

                                    <th className="px-6 py-4 text-right">
                                        Haber
                                    </th>

                                    <th className="px-6 py-4 text-right">
                                        Saldo Deudor
                                    </th>

                                    <th className="px-6 py-4 text-right">
                                        Saldo Acreedor
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {trialBalanceReport.accounts.map(
                                    (
                                        account,
                                    ) => (
                                        <tr
                                            key={
                                                account.accountId
                                            }
                                            className="border-b border-slate-800/70 last:border-b-0"
                                        >
                                            <td className="px-6 py-5 font-semibold text-blue-300">
                                                {
                                                    account.accountCode
                                                }
                                            </td>

                                            <td className="px-6 py-5">
                                                {
                                                    account.accountName
                                                }
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-400">
                                                {
                                                    account.type
                                                }
                                            </td>

                                            <td className="px-6 py-5 text-right font-semibold text-emerald-300">
                                                {formatCurrency(
                                                    account.totalDebit,
                                                )}
                                            </td>

                                            <td className="px-6 py-5 text-right font-semibold text-blue-300">
                                                {formatCurrency(
                                                    account.totalCredit,
                                                )}
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                {formatCurrency(
                                                    account.debitBalance,
                                                )}
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                {formatCurrency(
                                                    account.creditBalance,
                                                )}
                                            </td>
                                        </tr>
                                    ),
                                )}
                                </tbody>

                                <tfoot>
                                <tr className="border-t border-slate-700 bg-slate-900/40 font-black">
                                    <td
                                        colSpan={3}
                                        className="px-6 py-5 text-right"
                                    >
                                        TOTALES
                                    </td>

                                    <td className="px-6 py-5 text-right text-emerald-300">
                                        {formatCurrency(
                                            trialBalanceReport.totalDebit,
                                        )}
                                    </td>

                                    <td className="px-6 py-5 text-right text-blue-300">
                                        {formatCurrency(
                                            trialBalanceReport.totalCredit,
                                        )}
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        {formatCurrency(
                                            trialBalanceReport.totalDebitBalance,
                                        )}
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        {formatCurrency(
                                            trialBalanceReport.totalCreditBalance,
                                        )}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </article>
            )}

            {/* SIN REPORTE */}

            {!journalReport &&
                !ledgerReport &&
                !trialBalanceReport &&
                !loadingReport && (
                    <div className="mt-7 rounded-2xl border border-dashed border-slate-700 bg-[#071329]/40 px-6 py-14 text-center">
                        <FileBarChart
                            size={38}
                            className="mx-auto text-slate-600"
                        />

                        <h3 className="mt-4 font-bold text-slate-300">
                            Selecciona un reporte
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Elige el período y presiona “Generar reporte”.
                        </p>
                    </div>
                )}
        </section>
    )
}

export default ReportsPage