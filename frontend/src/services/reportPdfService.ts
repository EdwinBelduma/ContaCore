import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

import type {
    BalanceSheetAccount,
    BalanceSheetReportResponse,
    IncomeStatementAccount,
    IncomeStatementReportResponse,
    JournalReportResponse,
    LedgerReportResponse,
    TrialBalanceReportResponse,
} from './reportService'

type PdfWithAutoTable = jsPDF & {
    lastAutoTable?: {
        finalY: number
    }
}

function money(value?: number | null) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0))
}

function formatDate(value?: string | null) {
    if (!value) {
        return '-'
    }

    return new Intl.DateTimeFormat('es-EC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(`${value}T00:00:00`))
}

function safeFileName(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
}

function addHeader(
    doc: jsPDF,
    title: string,
    entityName: string,
    subtitle: string,
) {
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('ContaCore', 14, 18)

    doc.setFontSize(14)
    doc.text(title, 14, 29)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(entityName || 'Entidad contable', 14, 37)
    doc.text(subtitle, 14, 43)

    doc.setDrawColor(200)
    doc.line(14, 48, pageWidth - 14, 48)
}

function addPageNumbers(doc: jsPDF) {
    const pages = doc.getNumberOfPages()

    for (let page = 1; page <= pages; page += 1) {
        doc.setPage(page)

        const pageHeight = doc.internal.pageSize.getHeight()

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)

        doc.text(
            `ContaCore - Página ${page} de ${pages}`,
            14,
            pageHeight - 8,
        )
    }
}

function finalY(doc: jsPDF) {
    return (doc as PdfWithAutoTable).lastAutoTable?.finalY ?? 55
}

function ensureSpace(doc: jsPDF, y: number, needed = 35) {
    const pageHeight = doc.internal.pageSize.getHeight()

    if (y + needed > pageHeight - 18) {
        doc.addPage()
        return 20
    }

    return y
}

/* =========================================================
   HELPERS - ESTADO DE RESULTADOS
========================================================= */

function incomeStatementAmount(account: IncomeStatementAccount) {
    if (account.balance !== undefined) {
        return Number(account.balance)
    }

    if (account.amount !== undefined) {
        return Number(account.amount)
    }

    if (account.total !== undefined) {
        return Number(account.total)
    }

    const debit = Number(account.totalDebit ?? 0)
    const credit = Number(account.totalCredit ?? 0)

    if (account.type === 'INCOME') {
        return Math.abs(credit - debit)
    }

    return Math.abs(debit - credit)
}

function getIncomeAccounts(report: IncomeStatementReportResponse) {
    return (
        report.incomeAccounts ??
        report.incomes ??
        report.accounts?.filter((account) => account.type === 'INCOME') ??
        []
    )
}

function getExpenseAccounts(report: IncomeStatementReportResponse) {
    return (
        report.expenseAccounts ??
        report.expenses ??
        report.accounts?.filter((account) => account.type === 'EXPENSE') ??
        []
    )
}

/* =========================================================
   HELPERS - BALANCE GENERAL
========================================================= */

function balanceSheetAmount(account: BalanceSheetAccount) {
    if (account.balance !== undefined) {
        return Number(account.balance)
    }

    if (account.amount !== undefined) {
        return Number(account.amount)
    }

    if (account.total !== undefined) {
        return Number(account.total)
    }

    const debit = Number(account.totalDebit ?? 0)
    const credit = Number(account.totalCredit ?? 0)

    if (account.type === 'ASSET') {
        return Math.abs(debit - credit)
    }

    return Math.abs(credit - debit)
}

function getAssetAccounts(report: BalanceSheetReportResponse) {
    return (
        report.assetAccounts ??
        report.assets ??
        report.accounts?.filter((account) => account.type === 'ASSET') ??
        []
    )
}

function getLiabilityAccounts(report: BalanceSheetReportResponse) {
    return (
        report.liabilityAccounts ??
        report.liabilities ??
        report.accounts?.filter((account) => account.type === 'LIABILITY') ??
        []
    )
}

function getEquityAccounts(report: BalanceSheetReportResponse) {
    return (
        report.equityAccounts ??
        report.equity ??
        report.accounts?.filter((account) => account.type === 'EQUITY') ??
        []
    )
}

/* =========================================================
   LIBRO DIARIO
========================================================= */

export function exportJournalReportPdf(report: JournalReportResponse) {
    const doc = new jsPDF()

    addHeader(
        doc,
        'Libro Diario',
        report.accountingEntityName,
        `Del ${formatDate(report.from)} al ${formatDate(report.to)}`,
    )

    const rows = report.entries.flatMap((entry) =>
        entry.lines.map((line) => [
            formatDate(entry.entryDate),
            entry.reference ?? '-',
            entry.description,
            `${line.accountCode} - ${line.accountName}`,
            line.description ?? '-',
            Number(line.debit) > 0 ? money(line.debit) : '-',
            Number(line.credit) > 0 ? money(line.credit) : '-',
        ]),
    )

    autoTable(doc, {
        startY: 54,
        head: [[
            'Fecha',
            'Referencia',
            'Asiento',
            'Cuenta',
            'Detalle',
            'Debe',
            'Haber',
        ]],
        body: rows,
        styles: {
            fontSize: 7,
            cellPadding: 2,
        },
        columnStyles: {
            5: { halign: 'right' },
            6: { halign: 'right' },
        },
    })

    const y = ensureSpace(doc, finalY(doc) + 8, 20)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`Total Debe: ${money(report.totalDebit)}`, 105, y)
    doc.text(`Total Haber: ${money(report.totalCredit)}`, 105, y + 7)

    addPageNumbers(doc)

    doc.save(
        safeFileName(
            `ContaCore-Libro-Diario-${report.from}-${report.to}.pdf`,
        ),
    )
}

/* =========================================================
   LIBRO MAYOR
========================================================= */

export function exportLedgerReportPdf(report: LedgerReportResponse) {
    const doc = new jsPDF()

    addHeader(
        doc,
        'Libro Mayor',
        report.accountingEntityName,
        `${report.accountCode} - ${report.accountName} | ${formatDate(report.from)} al ${formatDate(report.to)}`,
    )

    autoTable(doc, {
        startY: 54,
        head: [[
            'Fecha',
            'Referencia',
            'Descripción',
            'Debe',
            'Haber',
            'Saldo',
        ]],
        body: report.movements.map((movement) => [
            formatDate(movement.entryDate),
            movement.reference ?? '-',
            movement.description,
            Number(movement.debit) > 0 ? money(movement.debit) : '-',
            Number(movement.credit) > 0 ? money(movement.credit) : '-',
            money(movement.balance),
        ]),
        styles: {
            fontSize: 8,
        },
        columnStyles: {
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' },
        },
    })

    const y = ensureSpace(doc, finalY(doc) + 8, 22)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`Saldo inicial: ${money(report.openingBalance)}`, 14, y)
    doc.text(`Saldo final: ${money(report.closingBalance)}`, 105, y)
    doc.text(`Total Debe: ${money(report.totalDebit)}`, 14, y + 7)
    doc.text(`Total Haber: ${money(report.totalCredit)}`, 105, y + 7)

    addPageNumbers(doc)

    doc.save(
        safeFileName(
            `ContaCore-Libro-Mayor-${report.accountCode}-${report.from}-${report.to}.pdf`,
        ),
    )
}

/* =========================================================
   BALANZA DE COMPROBACIÓN
========================================================= */

export function exportTrialBalancePdf(report: TrialBalanceReportResponse) {
    const doc = new jsPDF('landscape')

    addHeader(
        doc,
        'Balanza de Comprobación',
        report.accountingEntityName,
        `Del ${formatDate(report.from)} al ${formatDate(report.to)}`,
    )

    autoTable(doc, {
        startY: 54,
        head: [[
            'Código',
            'Cuenta',
            'Tipo',
            'Debe',
            'Haber',
            'Saldo Deudor',
            'Saldo Acreedor',
        ]],
        body: report.accounts.map((account) => [
            account.accountCode,
            account.accountName,
            account.type,
            money(account.totalDebit),
            money(account.totalCredit),
            money(account.debitBalance),
            money(account.creditBalance),
        ]),
        styles: {
            fontSize: 8,
        },
        columnStyles: {
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' },
            6: { halign: 'right' },
        },
    })

    const y = ensureSpace(doc, finalY(doc) + 8, 15)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`Total Debe: ${money(report.totalDebit)}`, 14, y)
    doc.text(`Total Haber: ${money(report.totalCredit)}`, 95, y)
    doc.text(
        report.balanced ? 'Estado: BALANCEADA' : 'Estado: NO BALANCEADA',
        185,
        y,
    )

    addPageNumbers(doc)

    doc.save(
        safeFileName(
            `ContaCore-Balanza-Comprobacion-${report.from}-${report.to}.pdf`,
        ),
    )
}

/* =========================================================
   ESTADO DE RESULTADOS
========================================================= */

export function exportIncomeStatementPdf(
    report: IncomeStatementReportResponse,
) {
    const doc = new jsPDF()

    const incomes = getIncomeAccounts(report)
    const expenses = getExpenseAccounts(report)

    const calculatedIncome = incomes.reduce(
        (total, account) => total + incomeStatementAmount(account),
        0,
    )

    const calculatedExpenses = expenses.reduce(
        (total, account) => total + incomeStatementAmount(account),
        0,
    )

    const totalIncome =
        report.totalIncome ??
        report.totalIncomes ??
        calculatedIncome

    const totalExpenses =
        report.totalExpenses ??
        report.totalExpense ??
        calculatedExpenses

    const result =
        report.netIncome ??
        report.netResult ??
        report.result ??
        totalIncome - totalExpenses

    addHeader(
        doc,
        'Estado de Resultados',
        report.accountingEntityName,
        `Del ${formatDate(report.from)} al ${formatDate(report.to)}`,
    )

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('INGRESOS', 14, 58)

    autoTable(doc, {
        startY: 63,
        head: [['Código', 'Cuenta', 'Valor']],
        body: incomes.map((account) => [
            account.accountCode,
            account.accountName,
            money(incomeStatementAmount(account)),
        ]),
        columnStyles: {
            2: { halign: 'right' },
        },
    })

    let y = ensureSpace(doc, finalY(doc) + 8, 35)

    doc.setFont('helvetica', 'bold')
    doc.text(`Total ingresos: ${money(totalIncome)}`, 110, y)

    y += 14
    y = ensureSpace(doc, y, 45)

    doc.text('GASTOS', 14, y)

    autoTable(doc, {
        startY: y + 5,
        head: [['Código', 'Cuenta', 'Valor']],
        body: expenses.map((account) => [
            account.accountCode,
            account.accountName,
            money(incomeStatementAmount(account)),
        ]),
        columnStyles: {
            2: { halign: 'right' },
        },
    })

    y = ensureSpace(doc, finalY(doc) + 8, 30)

    doc.text(`Total gastos: ${money(totalExpenses)}`, 110, y)

    y += 15
    y = ensureSpace(doc, y, 15)

    doc.setFontSize(13)
    doc.text(
        result >= 0 ? 'UTILIDAD DEL PERÍODO' : 'PÉRDIDA DEL PERÍODO',
        14,
        y,
    )
    doc.text(money(result), 145, y)

    addPageNumbers(doc)

    doc.save(
        safeFileName(
            `ContaCore-Estado-Resultados-${report.from}-${report.to}.pdf`,
        ),
    )
}

/* =========================================================
   BALANCE GENERAL
========================================================= */

export function exportBalanceSheetPdf(report: BalanceSheetReportResponse) {
    const doc = new jsPDF()

    const assets = getAssetAccounts(report)
    const liabilities = getLiabilityAccounts(report)
    const equity = getEquityAccounts(report)

    const calculatedAssets = assets.reduce(
        (total, account) => total + balanceSheetAmount(account),
        0,
    )

    const calculatedLiabilities = liabilities.reduce(
        (total, account) => total + balanceSheetAmount(account),
        0,
    )

    const calculatedEquity = equity.reduce(
        (total, account) => total + balanceSheetAmount(account),
        0,
    )

    const totalAssets = report.totalAssets ?? calculatedAssets
    const totalLiabilities = report.totalLiabilities ?? calculatedLiabilities
    const totalEquity = report.totalEquity ?? calculatedEquity

    const liabilitiesAndEquity =
        report.totalLiabilitiesAndEquity ??
        totalLiabilities + totalEquity

    const balanced =
        report.balanced ??
        Math.abs(totalAssets - liabilitiesAndEquity) < 0.01

    addHeader(
        doc,
        'Balance General',
        report.accountingEntityName,
        `Al ${formatDate(report.asOf)}`,
    )

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('ACTIVOS', 14, 58)

    autoTable(doc, {
        startY: 63,
        head: [['Código', 'Cuenta', 'Valor']],
        body: assets.map((account) => [
            account.accountCode,
            account.accountName,
            money(balanceSheetAmount(account)),
        ]),
        columnStyles: {
            2: { halign: 'right' },
        },
    })

    let y = ensureSpace(doc, finalY(doc) + 7, 35)

    doc.text(`Total Activos: ${money(totalAssets)}`, 110, y)

    y += 13
    y = ensureSpace(doc, y, 45)

    doc.text('PASIVOS', 14, y)

    autoTable(doc, {
        startY: y + 5,
        head: [['Código', 'Cuenta', 'Valor']],
        body: liabilities.map((account) => [
            account.accountCode,
            account.accountName,
            money(balanceSheetAmount(account)),
        ]),
        columnStyles: {
            2: { halign: 'right' },
        },
    })

    y = ensureSpace(doc, finalY(doc) + 7, 35)

    doc.text(`Total Pasivos: ${money(totalLiabilities)}`, 110, y)

    y += 13
    y = ensureSpace(doc, y, 45)

    doc.text('PATRIMONIO', 14, y)

    autoTable(doc, {
        startY: y + 5,
        head: [['Código', 'Cuenta', 'Valor']],
        body: equity.map((account) => [
            account.accountCode,
            account.accountName,
            money(balanceSheetAmount(account)),
        ]),
        columnStyles: {
            2: { halign: 'right' },
        },
    })

    y = ensureSpace(doc, finalY(doc) + 8, 35)

    doc.text(`Total Patrimonio: ${money(totalEquity)}`, 14, y)
    doc.text(
        `Pasivos + Patrimonio: ${money(liabilitiesAndEquity)}`,
        95,
        y,
    )

    y += 10

    doc.text(
        balanced ? 'Estado: BALANCEADO' : 'Estado: NO BALANCEADO',
        14,
        y,
    )

    addPageNumbers(doc)

    doc.save(
        safeFileName(
            `ContaCore-Balance-General-${report.asOf}.pdf`,
        ),
    )
}
