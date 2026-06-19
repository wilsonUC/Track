import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchCategories, fetchTransactions } from '../../api/finanzas'
import { DateFilterToolbar } from '../filters/DateFilterToolbar'
import { useDateFilter } from '../../hooks/useDateFilter'
import {
  buildCategoryExpenses,
  buildCategoryMap,
  buildLast6MonthsChart,
  computeSavingsPercent,
  enrichTransactions,
  filterByDateRange,
  getBalanceSubtitle,
  getSavingsSubtitle,
  sortByDateDesc,
  sumByType,
  type EnrichedTransaction,
} from '../../utils/dashboardMetrics'
import { formatSoles } from '../../utils/financeFormat'
import { DashboardChartsSection } from './DashboardChartsSection'
import { DashboardMonthCard } from './DashboardMonthCard'
import { DashboardRecentTransactions } from './DashboardRecentTransactions'
import { DashboardSummaryCard } from './DashboardSummaryCard'

type OutletContext = {
  transactionsVersion: number
}

export function DashboardPanel() {
  const { transactionsVersion } = useOutletContext<OutletContext>()
  const [activeCard, setActiveCard] = useState<'balance' | 'income' | 'expense' | 'savings'>('balance')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [allTransactions, setAllTransactions] = useState<EnrichedTransaction[]>([])

  const dateFilter = useDateFilter({ defaultPreset: 'month' })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchTransactions(), fetchCategories()])
      .then(([transactions, categories]) => {
        if (cancelled) return
        const categoryMap = buildCategoryMap(categories)
        setAllTransactions(enrichTransactions(transactions, categoryMap))
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
  }, [transactionsVersion])

  const filtered = useMemo(
    () => filterByDateRange(allTransactions, dateFilter.range),
    [allTransactions, dateFilter.range],
  )

  const periodTotals = useMemo(() => sumByType(filtered), [filtered])
  const balance = periodTotals.income - periodTotals.expense
  const savingsPercent = useMemo(
    () => computeSavingsPercent(periodTotals.income, periodTotals.expense),
    [periodTotals],
  )

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardSummaryCard
          title="Balance"
          amount={formatSoles(balance)}
          subtitle={getBalanceSubtitle(balance)}
          variant="balance"
          isActive={activeCard === 'balance'}
          onClick={() => setActiveCard('balance')}
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
          amount={`${savingsPercent}%`}
          subtitle={getSavingsSubtitle(savingsPercent)}
          variant="savings"
          isActive={activeCard === 'savings'}
          onClick={() => setActiveCard('savings')}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
      </div>

      <DashboardChartsSection
        categoryExpenses={categoryExpenses}
        monthlyChart={monthlyChart}
        loading={loading}
      />

      <DashboardRecentTransactions transactions={recent} loading={loading} />
    </section>
  )
}
