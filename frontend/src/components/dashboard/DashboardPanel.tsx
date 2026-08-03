import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchCategories, fetchTransactions } from '../../api/finanzas'
import { DateFilterToolbar } from '../filters/DateFilterToolbar'
import { useDateFilter } from '../../hooks/useDateFilter'
import {
  buildCategoryExpenses,
  buildCategoryMap,
  buildLast6MonthsChart,
  enrichTransactions,
  filterByDateRange,
  getBalanceSubtitle,
  getSavingsSubtitle,
  getTotalBalanceSubtitle,
  sortByDateDesc,
  sumByType,
  type EnrichedTransaction,
} from '../../utils/dashboardMetrics'
import { formatSoles } from '../../utils/financeFormat'
import { DashboardCategoryExpenses } from './DashboardCategoryExpenses'
import { DashboardMonthlyChart } from './DashboardMonthlyChart'
import { DashboardMonthCard } from './DashboardMonthCard'
import { DashboardRecentTransactions } from './DashboardRecentTransactions'
import { DashboardSummaryCard } from './DashboardSummaryCard'
import { fetchRecurrentes } from '../../api/recurrentes'
import { mapRecurrenteToCard } from '../../utils/recurrentesDisplay'
import type { RecurrenteCardView } from '../recurrentes/recurrentesTypes'

type OutletContext = {
  transactionsVersion: number
}

export function DashboardPanel() {
  const { transactionsVersion } = useOutletContext<OutletContext>()
  const [activeCard, setActiveCard] = useState<'balance' | 'income' | 'expense' | 'savings'>('balance')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [allTransactions, setAllTransactions] = useState<EnrichedTransaction[]>([])
  const [recurrentes, setRecurrentes] = useState<RecurrenteCardView[]>([])

  const dateFilter = useDateFilter({ defaultPreset: 'month' })

  const dateStart = dateFilter.range.start || new Date()
  const mesIso = useMemo(() => {
    const dObj = typeof dateStart === 'string' ? new Date(dateStart) : dateStart
    const y = dObj.getFullYear()
    const m = String(dObj.getMonth() + 1).padStart(2, '0')
    const d = String(dObj.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }, [dateStart])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchTransactions(), fetchCategories(), fetchRecurrentes(mesIso)])
      .then(([transactions, categories, recs]) => {
        if (cancelled) return
        const categoryMap = buildCategoryMap(categories)
        setAllTransactions(enrichTransactions(transactions, categoryMap))
        setRecurrentes(recs.map(mapRecurrenteToCard))
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los datos del dashboard.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [transactionsVersion, mesIso])

  const filtered = useMemo(
    () => filterByDateRange(allTransactions, dateFilter.range),
    [allTransactions, dateFilter.range],
  )

  const periodTotals = useMemo(() => sumByType(filtered), [filtered])
  const balance = periodTotals.income - periodTotals.expense
  const saldoDisponible = balance

  const allTimeTotals = useMemo(() => sumByType(allTransactions), [allTransactions])
  const totalBalance = allTimeTotals.income - allTimeTotals.expense

  const periodIncome = useMemo(
    () => sortByDateDesc(filtered.filter((t) => t.tipo === 'income')),
    [filtered],
  )
  const periodExpense = useMemo(
    () => sortByDateDesc(filtered.filter((t) => t.tipo === 'expense')),
    [filtered],
  )
  const categoryExpenses = useMemo(
    () => buildCategoryExpenses(periodExpense),
    [periodExpense],
  )
  const monthlyChart = useMemo(
    () => buildLast6MonthsChart(filtered, new Date()),
    [filtered],
  )
  const recent = useMemo(() => sortByDateDesc(filtered).slice(0, 8), [filtered])

  const totalPendienteGastos = useMemo(() => {
    const gastos = recurrentes.filter((r) => r.tipo === 'expense')
    return gastos.filter((r) => r.activoEnMes && !r.registradoMes).reduce((acc, r) => acc + r.monto, 0)
  }, [recurrentes])

  const totalPendienteIngresos = useMemo(() => {
    const ingresos = recurrentes.filter((r) => r.tipo === 'income')
    return ingresos.filter((r) => r.activoEnMes && !r.registradoMes).reduce((acc, r) => acc + r.monto, 0)
  }, [recurrentes])

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        {error}
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <DateFilterToolbar
        preset={dateFilter.preset}
        onPresetChange={dateFilter.setPreset}
        customStart={dateFilter.customStart}
        customEnd={dateFilter.customEnd}
        onCustomStartChange={dateFilter.setCustomStart}
        onCustomEndChange={dateFilter.setCustomEnd}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <DashboardSummaryCard
          title="Balance"
          amount={formatSoles(balance)}
          subtitle={getBalanceSubtitle(balance)}
          variant="balance"
          isActive={activeCard === 'balance'}
          onClick={() => setActiveCard('balance')}
        />
        <DashboardSummaryCard
          title="Balance total"
          amount={formatSoles(totalBalance)}
          subtitle={getTotalBalanceSubtitle(totalBalance)}
          variant="totalBalance"
        />
        <DashboardSummaryCard
          title="Ingresos"
          amount={formatSoles(periodTotals.income)}
          subtitle={dateFilter.label}
          variant="income"
          isActive={activeCard === 'income'}
          onClick={() => setActiveCard('income')}
        />
        <DashboardSummaryCard
          title="Gastos"
          amount={formatSoles(periodTotals.expense)}
          subtitle={dateFilter.label}
          variant="expense"
          isActive={activeCard === 'expense'}
          onClick={() => setActiveCard('expense')}
        />
        <DashboardSummaryCard
          title="Ahorro"
          amount={formatSoles(periodTotals.saving)}
          subtitle={getSavingsSubtitle(saldoDisponible, periodTotals.saving, dateFilter.label)}
          variant="savings"
          isActive={activeCard === 'savings'}
          onClick={() => setActiveCard('savings')}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Columna Izquierda */}
        <div className="space-y-4">
          <DashboardMonthCard
            variant="income"
            transactions={periodIncome}
            loading={loading}
            periodLabel={dateFilter.label}
          />
          <DashboardMonthCard
            variant="expense"
            transactions={periodExpense}
            loading={loading}
            periodLabel={dateFilter.label}
          />
          <DashboardCategoryExpenses
            categoryExpenses={categoryExpenses}
            loading={loading}
          />
        </div>

        {/* Columna Derecha */}
        <div className="space-y-4">
          <DashboardRecentTransactions
            transactions={recent}
            loading={loading}
            totalPendienteGastos={totalPendienteGastos}
            totalPendienteIngresos={totalPendienteIngresos}
          />
          <DashboardMonthlyChart
            data={monthlyChart}
            loading={loading}
          />
        </div>
      </div>
    </section>
  )
}
