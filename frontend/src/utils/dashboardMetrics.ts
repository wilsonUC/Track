import type { ApiCategory, ApiTransaction } from '../api/finanzas'
import { getCategoryChartColors } from './categoryDisplay'
import type { DateRange } from './dateFilters'
import { isDateInRange } from './dateFilters'
import { formatChartMonth, isSameMonth, parseTransactionDate } from './financeFormat'

export type EnrichedTransaction = ApiTransaction & {
  montoNum: number
  categoriaNombre: string
  presupuestoNombre: string | null
  recurrenteNombre: string | null
  esPresupuesto: boolean
  esRecurrente: boolean
  etiquetaOrigen: string
}

export type MonthChartPoint = {
  mes: string
  ingresos: number
  gastos: number
}

export type CategoryExpenseRow = {
  categoria: string
  monto: number
  porcentaje: number
  colorBg: string
  colorLight: string
}

const SAVINGS_GOAL_PERCENT = 20

export function buildCategoryMap(categories: ApiCategory[]) {
  return new Map(categories.map((c) => [c.id, c.nombre]))
}

export function enrichTransactions(
  transactions: ApiTransaction[],
  categoryMap: Map<number, string>,
): EnrichedTransaction[] {
  return transactions.map((t) => {
    const esPresupuesto = t.presupuesto != null
    const esRecurrente = t.recurrente != null
    const presupuestoNombre = t.presupuesto_nombre ?? null
    const recurrenteNombre = t.recurrente_nombre ?? null
    const categoriaNombre = t.categoria ? (categoryMap.get(t.categoria) ?? 'Sin categoría') : ''
    let etiquetaOrigen = categoriaNombre
    if (esPresupuesto) etiquetaOrigen = `Presupuesto: ${presupuestoNombre ?? 'Sin nombre'}`
    else if (esRecurrente) etiquetaOrigen = `Recurrente: ${recurrenteNombre ?? 'Sin nombre'}`

    return {
      ...t,
      montoNum: Number(t.monto),
      categoriaNombre,
      presupuestoNombre,
      recurrenteNombre,
      esPresupuesto,
      esRecurrente,
      etiquetaOrigen,
    }
  })
}

export function filterByMonth(transactions: EnrichedTransaction[], reference: Date) {
  return transactions.filter((t) => isSameMonth(t.fecha, reference))
}

export function filterByDateRange(transactions: EnrichedTransaction[], range: DateRange) {
  if (range.start === null && range.end === null) return transactions
  return transactions.filter((t) => isDateInRange(t.fecha, range))
}

export function sumByType(transactions: EnrichedTransaction[]) {
  return transactions.reduce(
    (acc, t) => {
      if (t.tipo === 'income') acc.income += t.montoNum
      else acc.expense += t.montoNum
      return acc
    },
    { income: 0, expense: 0 },
  )
}

export function computeSavingsPercent(income: number, expense: number) {
  if (income <= 0) return 0
  return Math.round(((income - expense) / income) * 100)
}

export function getBalanceSubtitle(balance: number) {
  if (balance > 0) return '¡Excelente balance! 💰'
  if (balance === 0) return 'Ingresos y gastos equilibrados'
  return 'Gastos superan ingresos en el período'
}

export function getSavingsSubtitle(savingsPercent: number) {
  if (savingsPercent >= SAVINGS_GOAL_PERCENT) {
    return `Meta: ${SAVINGS_GOAL_PERCENT}% | ¡Superada! 🚀`
  }
  return `Meta: ${SAVINGS_GOAL_PERCENT}% | Te faltan ${SAVINGS_GOAL_PERCENT - savingsPercent} pp`
}

export function buildLast6MonthsChart(
  transactions: EnrichedTransaction[],
  reference = new Date(),
): MonthChartPoint[] {
  const points: MonthChartPoint[] = []

  for (let i = 5; i >= 0; i -= 1) {
    const monthDate = new Date(reference.getFullYear(), reference.getMonth() - i, 1)
    const monthTransactions = transactions.filter((t) => {
      const date = parseTransactionDate(t.fecha)
      return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth()
    })

    const totals = sumByType(monthTransactions)
    points.push({
      mes: formatChartMonth(monthDate),
      ingresos: totals.income,
      gastos: totals.expense,
    })
  }

  return points
}

export function buildCategoryExpenses(expenseTransactions: EnrichedTransaction[]): CategoryExpenseRow[] {
  const totalsByCategory = new Map<string, number>()

  for (const t of expenseTransactions) {
    const label = t.esPresupuesto || t.esRecurrente ? t.etiquetaOrigen : t.categoriaNombre
    totalsByCategory.set(label, (totalsByCategory.get(label) ?? 0) + t.montoNum)
  }

  const totalExpenses = [...totalsByCategory.values()].reduce((sum, value) => sum + value, 0)
  if (totalExpenses <= 0) return []

  return [...totalsByCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, monto]) => ({
      categoria,
      monto,
      porcentaje: Math.round((monto / totalExpenses) * 1000) / 10,
      ...getCategoryChartColors(categoria),
    }))
}

export function getTopCategoryInsight(rows: CategoryExpenseRow[]) {
  if (rows.length === 0) return null
  const top = rows[0]
  return `El ${top.porcentaje}% de tus egresos se concentra en la categoría de ${top.categoria}.`
}

export function sortByDateDesc(transactions: EnrichedTransaction[]) {
  return [...transactions].sort((a, b) => {
    const dateDiff = parseTransactionDate(b.fecha).getTime() - parseTransactionDate(a.fecha).getTime()
    if (dateDiff !== 0) return dateDiff
    return b.id - a.id
  })
}
