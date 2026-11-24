import {
    BookOpenText,
    CalendarDays,
    CheckCircle2,
    Download,
    FileBarChart,
    Landmark,
    LoaderCircle,
    Search,
    Scale,
    TrendingUp,
    Building2,
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
    getBalanceSheetReport,
    getIncomeStatementReport,
    getJournalReport,
    getLedgerReport,
    getTrialBalanceReport,
    type BalanceSheetAccount,
    type BalanceSheetReportResponse,
    type IncomeStatementAccount,
    type IncomeStatementReportResponse,
    type JournalReportResponse,
    type LedgerReportResponse,
    type TrialBalanceReportResponse,
} from '../services/reportService'

import {
    exportBalanceSheetPdf,
    exportIncomeStatementPdf,
    exportJournalReportPdf,
    exportLedgerReportPdf,
    exportTrialBalancePdf,
} from '../services/reportPdfService'

type ReportType =
    | 'JOURNAL'
    | 'LEDGER'
    | 'TRIAL_BALANCE'
    | 'INCOME_STATEMENT'
    | 'BALANCE_SHEET'

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

    const [
        incomeStatementReport,
        setIncomeStatementReport,
    ] =
        useState<IncomeStatementReportResponse | null>(
            null,
        )

    const [
        balanceSheetReport,
        setBalanceSheetReport,
    ] =
        useState<BalanceSheetReportResponse | null>(
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
        value?: number | null,
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
        value?: string | null,
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
       AYUDAS ESTADO DE RESULTADOS
    ========================================================= */

    const getIncomeStatementAmount = (
        account: IncomeStatementAccount,
    ) => {
        if (
            account.balance !==
            undefined
        ) {
            return Number(
                account.balance,
            )
        }

        if (
            account.amount !==
            undefined
        ) {
            return Number(
                account.amount,
            )
        }

        if (
            account.total !==
            undefined
        ) {
            return Number(
                account.total,
            )
        }

        const debit =
            Number(
                account.totalDebit ??
                0,
            )

        const credit =
            Number(
                account.totalCredit ??
                0,
            )

        if (
            account.type ===
            'INCOME'
        ) {
            return Math.abs(
                credit - debit,
            )
        }

        return Math.abs(
            debit - credit,
        )
    }

    const incomeStatementAccounts =
        incomeStatementReport?.accounts ??
        []

    const incomeAccounts =
        incomeStatementReport?.incomeAccounts ??
        incomeStatementReport?.incomes ??
        incomeStatementAccounts.filter(
            (account) =>
                account.type ===
                'INCOME',
        )

    const expenseAccounts =
        incomeStatementReport?.expenseAccounts ??
        incomeStatementReport?.expenses ??
        incomeStatementAccounts.filter(
            (account) =>
                account.type ===
                'EXPENSE',
        )

    const calculatedTotalIncome =
        incomeAccounts.reduce(
            (
                total,
                account,
            ) =>
                total +
                getIncomeStatementAmount(
                    account,
                ),
            0,
        )

    const calculatedTotalExpenses =
        expenseAccounts.reduce(
            (
                total,
                account,
            ) =>
                total +
                getIncomeStatementAmount(
                    account,
                ),
            0,
        )

    const totalIncome =
        incomeStatementReport?.totalIncome ??
        incomeStatementReport?.totalIncomes ??
        calculatedTotalIncome

    const totalExpenses =
        incomeStatementReport?.totalExpenses ??
        incomeStatementReport?.totalExpense ??
        calculatedTotalExpenses

    const netResult =
        incomeStatementReport?.netIncome ??
        incomeStatementReport?.netResult ??
        incomeStatementReport?.result ??
        totalIncome -
        totalExpenses

    /* =========================================================
       AYUDAS BALANCE GENERAL
    ========================================================= */

    const getBalanceSheetAmount = (
        account: BalanceSheetAccount,
    ) => {
        if (
            account.balance !==
            undefined
        ) {
            return Number(
                account.balance,
            )
        }

        if (
            account.amount !==
            undefined
        ) {
            return Number(
                account.amount,
            )
        }

        if (
            account.total !==
            undefined
        ) {
            return Number(
                account.total,
            )
        }

        const debit =
            Number(
                account.totalDebit ??
                0,
            )

        const credit =
            Number(
                account.totalCredit ??
                0,
            )

        if (
            account.type ===
            'ASSET'
        ) {
            return Math.abs(
                debit - credit,
            )
        }

        return Math.abs(
            credit - debit,
        )
    }

    const balanceAccounts =
        balanceSheetReport?.accounts ??
        []

    const assetAccounts =
        balanceSheetReport?.assetAccounts ??
        balanceSheetReport?.assets ??
        balanceAccounts.filter(
            (account) =>
                account.type ===
                'ASSET',
        )

    const liabilityAccounts =
        balanceSheetReport?.liabilityAccounts ??
        balanceSheetReport?.liabilities ??
        balanceAccounts.filter(
            (account) =>
                account.type ===
                'LIABILITY',
        )

    const equityAccounts =
        balanceSheetReport?.equityAccounts ??
        balanceSheetReport?.equity ??
        balanceAccounts.filter(
            (account) =>
                account.type ===
                'EQUITY',
        )

    const calculatedAssets =
        assetAccounts.reduce(
            (
                total,
                account,
            ) =>
                total +
                getBalanceSheetAmount(
                    account,
                ),
            0,
        )

    const calculatedLiabilities =
        liabilityAccounts.reduce(
            (
                total,
                account,
            ) =>
                total +
                getBalanceSheetAmount(
                    account,
                ),
            0,
        )

    const calculatedEquity =
        equityAccounts.reduce(
            (
                total,
                account,
            ) =>
                total +
                getBalanceSheetAmount(
                    account,
                ),
            0,
        )

    const totalAssets =
        balanceSheetReport?.totalAssets ??
        calculatedAssets

    const totalLiabilities =
        balanceSheetReport?.totalLiabilities ??
        calculatedLiabilities

    const totalEquity =
        balanceSheetReport?.totalEquity ??
        calculatedEquity

    const totalLiabilitiesAndEquity =
        balanceSheetReport
            ?.totalLiabilitiesAndEquity ??
        totalLiabilities +
        totalEquity

    const balanceSheetBalanced =
        balanceSheetReport?.balanced ??
        Math.abs(
            totalAssets -
            totalLiabilitiesAndEquity,
        ) < 0.01

    /* =========================================================
       LIMPIAR REPORTES
    ========================================================= */

    const clearReports = () => {
        setJournalReport(
            null,
        )

        setLedgerReport(
            null,
        )

        setTrialBalanceReport(
            null,
        )

        setIncomeStatementReport(
            null,
        )

        setBalanceSheetReport(
            null,
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

            if (
                reportType ===
                'BALANCE_SHEET'
            ) {
                if (!to) {
                    setError(
                        'Selecciona la fecha del Balance General.',
                    )
                    return
                }
            } else {
                if (
                    !from ||
                    !to
                ) {
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

                clearReports()

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

                if (
                    reportType ===
                    'TRIAL_BALANCE'
                ) {
                    const result =
                        await getTrialBalanceReport(
                            entity.id,
                            from,
                            to,
                        )

                    setTrialBalanceReport(
                        result,
                    )

                    return
                }

                if (
                    reportType ===
                    'INCOME_STATEMENT'
                ) {
                    const result =
                        await getIncomeStatementReport(
                            entity.id,
                            from,
                            to,
                        )

                    setIncomeStatementReport(
                        result,
                    )

                    return
                }

                const result =
                    await getBalanceSheetReport(
                        entity.id,
                        to,
                    )

                setBalanceSheetReport(
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

    const handleExportPdf = () => {
        try {
            setError('')

            if (journalReport) {
                exportJournalReportPdf(
                    journalReport,
                )
                return
            }

            if (ledgerReport) {
                exportLedgerReportPdf(
                    ledgerReport,
                )
                return
            }

            if (trialBalanceReport) {
                exportTrialBalancePdf(
                    trialBalanceReport,
                )
                return
            }

            if (incomeStatementReport) {
                exportIncomeStatementPdf(
                    incomeStatementReport,
                )
                return
            }

            if (balanceSheetReport) {
                exportBalanceSheetPdf(
                    balanceSheetReport,
                )
                return
            }

            setError(
                'Primero genera un reporte antes de exportarlo.',
            )
        } catch (exception) {
            console.error(
                'Error exportando PDF:',
                exception,
            )

            setError(
                'No fue posible generar el archivo PDF.',
            )
        }
    }

    const hasGeneratedReport =
        Boolean(
            journalReport ||
            ledgerReport ||
            trialBalanceReport ||
            incomeStatementReport ||
            balanceSheetReport,
        )

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
                    Consulta los reportes financieros y contables de{' '}
                    {entity?.displayName ??
                        'tu entidad contable'}.
                </p>
            </div>

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* TIPOS DE REPORTES */}

            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
                        Asientos del período.
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
                        Movimientos por cuenta.
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
                        Balanza
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Verifica Debe y Haber.
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setReportType(
                            'INCOME_STATEMENT',
                        )
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                        reportType ===
                        'INCOME_STATEMENT'
                            ? 'border-cyan-500/50 bg-cyan-500/10'
                            : 'border-slate-800 bg-[#071329] hover:border-slate-700'
                    }`}
                >
                    <TrendingUp
                        size={25}
                        className="text-cyan-400"
                    />

                    <h3 className="mt-4 font-bold">
                        Estado de Resultados
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Ingresos, gastos y resultado.
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setReportType(
                            'BALANCE_SHEET',
                        )
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                        reportType ===
                        'BALANCE_SHEET'
                            ? 'border-amber-500/50 bg-amber-500/10'
                            : 'border-slate-800 bg-[#071329] hover:border-slate-700'
                    }`}
                >
                    <Building2
                        size={25}
                        className="text-amber-400"
                    />

                    <h3 className="mt-4 font-bold">
                        Balance General
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Activos, pasivos y patrimonio.
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
                            {reportType ===
                            'BALANCE_SHEET'
                                ? 'Fecha del Balance General'
                                : 'Período del reporte'}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {reportType ===
                            'BALANCE_SHEET'
                                ? 'Selecciona la fecha de corte.'
                                : 'Selecciona las fechas que deseas consultar.'}
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {reportType !==
                        'BALANCE_SHEET' && (
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
                        )}

                    <div>
                        <label className="text-sm font-semibold text-slate-300">
                            {reportType ===
                            'BALANCE_SHEET'
                                ? 'Fecha de corte *'
                                : 'Hasta *'}
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

                <div className="mt-6 flex flex-wrap justify-end gap-3">
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

                    <button
                        type="button"
                        onClick={
                            handleExportPdf
                        }
                        disabled={
                            !hasGeneratedReport ||
                            loadingReport
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Download
                            size={18}
                        />

                        Exportar PDF
                    </button>
                </div>
            </article>

            {/* =====================================================
          LIBRO DIARIO
      ====================================================== */}

            {journalReport && (
                <article className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">
                    <div className="border-b border-slate-800 px-6 py-5">
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

                    {journalReport.entries.map(
                        (entry) => (
                            <div
                                key={
                                    entry.id
                                }
                                className="border-b border-slate-800"
                            >
                                <div className="bg-slate-900/30 px-6 py-4">
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

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead>
                                        <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                                            <th className="px-6 py-3 text-left">
                                                Cuenta
                                            </th>

                                            <th className="px-6 py-3 text-left">
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
                                            (line) => (
                                                <tr
                                                    key={`${entry.id}-${line.lineNumber}`}
                                                    className="border-b border-slate-800/50"
                                                >
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold">
                                                            {
                                                                line.accountCode
                                                            }
                                                        </p>

                                                        <p className="text-sm text-slate-500">
                                                            {
                                                                line.accountName
                                                            }
                                                        </p>
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-slate-400">
                                                        {line.description ??
                                                            '-'}
                                                    </td>

                                                    <td className="px-6 py-4 text-right text-emerald-300">
                                                        {line.debit >
                                                        0
                                                            ? formatCurrency(
                                                                line.debit,
                                                            )
                                                            : '-'}
                                                    </td>

                                                    <td className="px-6 py-4 text-right text-blue-300">
                                                        {line.credit >
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

                    <div className="grid gap-4 bg-slate-900/30 p-6 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-slate-500">
                                Total Debe
                            </p>

                            <p className="text-xl font-black text-emerald-300">
                                {formatCurrency(
                                    journalReport.totalDebit,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Total Haber
                            </p>

                            <p className="text-xl font-black text-blue-300">
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
                    <div className="border-b border-slate-800 p-6">
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
                            <p className="text-sm text-slate-500">
                                Saldo inicial
                            </p>

                            <p className="font-bold">
                                {formatCurrency(
                                    ledgerReport.openingBalance,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Debe
                            </p>

                            <p className="font-bold text-emerald-300">
                                {formatCurrency(
                                    ledgerReport.totalDebit,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Haber
                            </p>

                            <p className="font-bold text-blue-300">
                                {formatCurrency(
                                    ledgerReport.totalCredit,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Saldo final
                            </p>

                            <p className="font-bold text-violet-300">
                                {formatCurrency(
                                    ledgerReport.closingBalance,
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px]">
                            <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                                <th className="px-6 py-4 text-left">
                                    Fecha
                                </th>

                                <th className="px-6 py-4 text-left">
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
                                        className="border-b border-slate-800/70"
                                    >
                                        <td className="px-6 py-4">
                                            {formatDate(
                                                movement.entryDate,
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {
                                                movement.description
                                            }
                                        </td>

                                        <td className="px-6 py-4 text-right text-emerald-300">
                                            {movement.debit >
                                            0
                                                ? formatCurrency(
                                                    movement.debit,
                                                )
                                                : '-'}
                                        </td>

                                        <td className="px-6 py-4 text-right text-blue-300">
                                            {movement.credit >
                                            0
                                                ? formatCurrency(
                                                    movement.credit,
                                                )
                                                : '-'}
                                        </td>

                                        <td className="px-6 py-4 text-right font-bold">
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
                </article>
            )}

            {/* =====================================================
          BALANZA DE COMPROBACIÓN
      ====================================================== */}

            {trialBalanceReport && (
                <article className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">
                    <div className="flex items-center justify-between border-b border-slate-800 p-6">
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

                        {trialBalanceReport.balanced && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300">
                <CheckCircle2
                    size={16}
                />

                Balanceada
              </span>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px]">
                            <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                                <th className="px-6 py-4 text-left">
                                    Código
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Cuenta
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
                                (account) => (
                                    <tr
                                        key={
                                            account.accountId
                                        }
                                        className="border-b border-slate-800/70"
                                    >
                                        <td className="px-6 py-4 text-blue-300">
                                            {
                                                account.accountCode
                                            }
                                        </td>

                                        <td className="px-6 py-4">
                                            {
                                                account.accountName
                                            }
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {formatCurrency(
                                                account.totalDebit,
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {formatCurrency(
                                                account.totalCredit,
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {formatCurrency(
                                                account.debitBalance,
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {formatCurrency(
                                                account.creditBalance,
                                            )}
                                        </td>
                                    </tr>
                                ),
                            )}
                            </tbody>
                        </table>
                    </div>
                </article>
            )}

            {/* =====================================================
          ESTADO DE RESULTADOS
      ====================================================== */}

            {incomeStatementReport && (
                <article className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">
                    <div className="border-b border-slate-800 p-6">
                        <h3 className="text-xl font-black">
                            Estado de Resultados
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {formatDate(
                                incomeStatementReport.from,
                            )}{' '}
                            -{' '}
                            {formatDate(
                                incomeStatementReport.to,
                            )}
                        </p>
                    </div>

                    <div className="grid gap-6 p-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                            <h4 className="text-lg font-bold text-emerald-300">
                                Ingresos
                            </h4>

                            <div className="mt-5 space-y-3">
                                {incomeAccounts.length ===
                                0 ? (
                                    <p className="text-sm text-slate-500">
                                        No existen ingresos para el período.
                                    </p>
                                ) : (
                                    incomeAccounts.map(
                                        (
                                            account,
                                        ) => (
                                            <div
                                                key={
                                                    account.accountId
                                                }
                                                className="flex items-center justify-between border-b border-slate-800/70 pb-3"
                                            >
                                                <div>
                                                    <p className="font-semibold">
                                                        {
                                                            account.accountCode
                                                        }{' '}
                                                        -{' '}
                                                        {
                                                            account.accountName
                                                        }
                                                    </p>
                                                </div>

                                                <span className="font-bold text-emerald-300">
                          {formatCurrency(
                              getIncomeStatementAmount(
                                  account,
                              ),
                          )}
                        </span>
                                            </div>
                                        ),
                                    )
                                )}
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-emerald-500/20 pt-4">
                <span className="font-bold">
                  Total ingresos
                </span>

                                <span className="text-xl font-black text-emerald-300">
                  {formatCurrency(
                      totalIncome,
                  )}
                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
                            <h4 className="text-lg font-bold text-rose-300">
                                Gastos
                            </h4>

                            <div className="mt-5 space-y-3">
                                {expenseAccounts.length ===
                                0 ? (
                                    <p className="text-sm text-slate-500">
                                        No existen gastos para el período.
                                    </p>
                                ) : (
                                    expenseAccounts.map(
                                        (
                                            account,
                                        ) => (
                                            <div
                                                key={
                                                    account.accountId
                                                }
                                                className="flex items-center justify-between border-b border-slate-800/70 pb-3"
                                            >
                                                <p className="font-semibold">
                                                    {
                                                        account.accountCode
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        account.accountName
                                                    }
                                                </p>

                                                <span className="font-bold text-rose-300">
                          {formatCurrency(
                              getIncomeStatementAmount(
                                  account,
                              ),
                          )}
                        </span>
                                            </div>
                                        ),
                                    )
                                )}
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-rose-500/20 pt-4">
                <span className="font-bold">
                  Total gastos
                </span>

                                <span className="text-xl font-black text-rose-300">
                  {formatCurrency(
                      totalExpenses,
                  )}
                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 bg-slate-900/30 p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Resultado del período
                                </p>

                                <p className="font-bold">
                                    {netResult >= 0
                                        ? 'Utilidad'
                                        : 'Pérdida'}
                                </p>
                            </div>

                            <p
                                className={`text-3xl font-black ${
                                    netResult >= 0
                                        ? 'text-emerald-300'
                                        : 'text-rose-300'
                                }`}
                            >
                                {formatCurrency(
                                    netResult,
                                )}
                            </p>
                        </div>
                    </div>
                </article>
            )}

            {/* =====================================================
          BALANCE GENERAL
      ====================================================== */}

            {balanceSheetReport && (
                <article className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">
                    <div className="flex flex-col gap-3 border-b border-slate-800 p-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-xl font-black">
                                Balance General
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Al{' '}
                                {formatDate(
                                    balanceSheetReport.asOf ??
                                    to,
                                )}
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-4 py-2 text-sm font-bold ${
                                balanceSheetBalanced
                                    ? 'bg-emerald-500/10 text-emerald-300'
                                    : 'bg-rose-500/10 text-rose-300'
                            }`}
                        >
              {balanceSheetBalanced
                  ? 'Balanceado'
                  : 'No balanceado'}
            </span>
                    </div>

                    <div className="grid gap-6 p-6 xl:grid-cols-3">
                        {/* ACTIVOS */}

                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                            <h4 className="text-lg font-bold text-blue-300">
                                Activos
                            </h4>

                            <div className="mt-5 space-y-3">
                                {assetAccounts.map(
                                    (
                                        account,
                                    ) => (
                                        <div
                                            key={
                                                account.accountId
                                            }
                                            className="flex justify-between border-b border-slate-800 pb-3"
                                        >
                      <span>
                        {
                            account.accountCode
                        }{' '}
                          -{' '}
                          {
                              account.accountName
                          }
                      </span>

                                            <strong>
                                                {formatCurrency(
                                                    getBalanceSheetAmount(
                                                        account,
                                                    ),
                                                )}
                                            </strong>
                                        </div>
                                    ),
                                )}
                            </div>

                            <div className="mt-5 flex justify-between border-t border-blue-500/20 pt-4">
                                <strong>
                                    Total activos
                                </strong>

                                <strong className="text-blue-300">
                                    {formatCurrency(
                                        totalAssets,
                                    )}
                                </strong>
                            </div>
                        </div>

                        {/* PASIVOS */}

                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                            <h4 className="text-lg font-bold text-amber-300">
                                Pasivos
                            </h4>

                            <div className="mt-5 space-y-3">
                                {liabilityAccounts.map(
                                    (
                                        account,
                                    ) => (
                                        <div
                                            key={
                                                account.accountId
                                            }
                                            className="flex justify-between border-b border-slate-800 pb-3"
                                        >
                      <span>
                        {
                            account.accountCode
                        }{' '}
                          -{' '}
                          {
                              account.accountName
                          }
                      </span>

                                            <strong>
                                                {formatCurrency(
                                                    getBalanceSheetAmount(
                                                        account,
                                                    ),
                                                )}
                                            </strong>
                                        </div>
                                    ),
                                )}
                            </div>

                            <div className="mt-5 flex justify-between border-t border-amber-500/20 pt-4">
                                <strong>
                                    Total pasivos
                                </strong>

                                <strong className="text-amber-300">
                                    {formatCurrency(
                                        totalLiabilities,
                                    )}
                                </strong>
                            </div>
                        </div>

                        {/* PATRIMONIO */}

                        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
                            <h4 className="text-lg font-bold text-violet-300">
                                Patrimonio
                            </h4>

                            <div className="mt-5 space-y-3">
                                {equityAccounts.map(
                                    (
                                        account,
                                    ) => (
                                        <div
                                            key={
                                                account.accountId
                                            }
                                            className="flex justify-between border-b border-slate-800 pb-3"
                                        >
                      <span>
                        {
                            account.accountCode
                        }{' '}
                          -{' '}
                          {
                              account.accountName
                          }
                      </span>

                                            <strong>
                                                {formatCurrency(
                                                    getBalanceSheetAmount(
                                                        account,
                                                    ),
                                                )}
                                            </strong>
                                        </div>
                                    ),
                                )}
                            </div>

                            <div className="mt-5 flex justify-between border-t border-violet-500/20 pt-4">
                                <strong>
                                    Total patrimonio
                                </strong>

                                <strong className="text-violet-300">
                                    {formatCurrency(
                                        totalEquity,
                                    )}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 border-t border-slate-800 bg-slate-900/30 p-6 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-slate-500">
                                Total Activos
                            </p>

                            <p className="mt-1 text-2xl font-black text-blue-300">
                                {formatCurrency(
                                    totalAssets,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Pasivos + Patrimonio
                            </p>

                            <p className="mt-1 text-2xl font-black text-emerald-300">
                                {formatCurrency(
                                    totalLiabilitiesAndEquity,
                                )}
                            </p>
                        </div>
                    </div>
                </article>
            )}

            {/* SIN REPORTE */}

            {!journalReport &&
                !ledgerReport &&
                !trialBalanceReport &&
                !incomeStatementReport &&
                !balanceSheetReport &&
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
                            Elige el reporte, selecciona las fechas y presiona “Generar reporte”.
                        </p>
                    </div>
                )}
        </section>
    )
}

export default ReportsPage
