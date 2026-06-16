import type { MonthlyBarData, ReportCategoryRow, ReportFilter } from '../components/reportes/reportesTypes'
import { getCategoryChartColors } from './categoryDisplay'
import {
  buildCategoryMap,
  buildLast6MonthsChart,
  enrichTransactions,
  type EnrichedTransaction,
} from './dashboardMetrics'
import { formatSoles } from './financeFormat'
import type { ApiCategory, ApiTransaction } from '../api/finanzas'

export type DonutSegment = {
  nombre: string
  valor: number
  porcentaje: number
  colorHex: string
}

const BAR_HEX: Record<string, string> = {
  'bg-slate-500': '#64748b',
  'bg-orange-500': '#f97316',
  'bg-rose-500': '#f43f5e',
  'bg-amber-500': '#f59e0b',
  'bg-violet-500': '#8b5cf6',
  'bg-sky-500': '#0ea5e9',
  'bg-purple-500': '#a855f7',
  'bg-emerald-500': '#10b981',
  'bg-indigo-500': '#6366f1',
  'bg-cyan-500': '#06b6d4',
  'bg-pink-500': '#ec4899',
  'bg-teal-500': '#14b8a6',
}

function barClassToHex(barClass: string) {
  return BAR_HEX[barClass] ?? '#6366f1'
}

export function buildMonthlyBarData(
  transactions: EnrichedTransaction[],
  reference = new Date(),
): MonthlyBarData[] {
  const chart = buildLast6MonthsChart(transactions, reference)
  const maxVal = Math.max(...chart.flatMap((p) => [p.ingresos, p.gastos]), 1)

  return chart.map((point) => ({
    mes: point.mes,
    ing: point.ingresos,
    gas: point.gastos,
    ingPercent: (point.ingresos / maxVal) * 100,
    gasPercent: (point.gastos / maxVal) * 100,
  }))
}

export function buildReportCategoryRows(transactions: EnrichedTransaction[]): ReportCategoryRow[] {
  const totals = new Map<string, { income: number; expense: number }>()

  for (const t of transactions) {
    const nombre = t.esPresupuesto || t.esRecurrente ? t.etiquetaOrigen : t.categoriaNombre
    const entry = totals.get(nombre) ?? { income: 0, expense: 0 }
    if (t.tipo === 'income') entry.income += t.montoNum
    else entry.expense += t.montoNum
    totals.set(nombre, entry)
  }

  const rows: ReportCategoryRow[] = []

  for (const [nombre, { income, expense }] of totals) {
    const { colorBg } = getCategoryChartColors(nombre)
    const color = colorBg

    if (income > 0) {
      rows.push({
        nombre,
        valorNum: income,
        total: formatSoles(income),
        tipo: 'ingreso',
        color,
        porcentaje: '0%',
      })
    }
    if (expense > 0) {
      rows.push({
        nombre,
        valorNum: expense,
        total: formatSoles(expense),
        tipo: 'gasto',
        color,
        porcentaje: '0%',
      })
    }
  }

  const grandTotal = rows.reduce((sum, row) => sum + row.valorNum, 0)

  return rows
    .map((row) => ({
      ...row,
      porcentaje: grandTotal > 0 ? `${((row.valorNum / grandTotal) * 100).toFixed(1)}%` : '0%',
    }))
    .sort((a, b) => b.valorNum - a.valorNum)
}

export function filterReportCategories(categories: ReportCategoryRow[], filter: ReportFilter) {
  if (filter === 'todos') return categories
  const tipo = filter === 'ingresos' ? 'ingreso' : 'gasto'
  const filtered = categories.filter((cat) => cat.tipo === tipo)
  const total = filtered.reduce((sum, cat) => sum + cat.valorNum, 0)

  return filtered.map((cat) => ({
    ...cat,
    porcentaje: total > 0 ? `${((cat.valorNum / total) * 100).toFixed(1)}%` : '0%',
  }))
}

export function buildDonutSegments(categories: ReportCategoryRow[]): DonutSegment[] {
  const total = categories.reduce((sum, cat) => sum + cat.valorNum, 0)
  if (total <= 0) return []

  return categories.slice(0, 6).map((cat) => ({
    nombre: cat.nombre,
    valor: cat.valorNum,
    porcentaje: (cat.valorNum / total) * 100,
    colorHex: barClassToHex(cat.color),
  }))
}

export function prepareReportData(transactions: ApiTransaction[], categories: ApiCategory[]) {
  const categoryMap = buildCategoryMap(categories)
  const enriched = enrichTransactions(transactions, categoryMap)
  const reference = new Date()

  const categoryRows = buildReportCategoryRows(enriched)
  const monthlyBars = buildMonthlyBarData(enriched, reference)

  return { enriched, categoryRows, monthlyBars }
}

export function downloadReportCsv(
  categories: ReportCategoryRow[],
  monthlyBars: MonthlyBarData[],
  filter: ReportFilter,
) {
  const filterLabel = filter === 'todos' ? 'Todo' : filter === 'ingresos' ? 'Ingresos' : 'Gastos'
  const lines = [
    'Reporte FinanzasTrack',
    `Filtro: ${filterLabel}`,
    `Generado: ${new Date().toLocaleString('es-PE')}`,
    '',
    'Historial mensual (últimos 6 meses)',
    'Mes,Ingresos,Gastos',
    ...monthlyBars.map((bar) => `${bar.mes},${bar.ing},${bar.gas}`),
    '',
    'Desglose por categoría',
    'Categoría,Tipo,Peso %,Total',
    ...categories.map((cat) =>
      `${cat.nombre},${cat.tipo},${cat.porcentaje},${cat.valorNum}`,
    ),
  ]

  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `reporte-finanzas-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
