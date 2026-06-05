import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchCategories, fetchTransactions } from '../../api/finanzas'
import {
  buildCategoryExpenses,
  buildCategoryMap,
  buildLast6MonthsChart,
  computeSavingsPercent,
  enrichTransactions,
  filterByMonth,
  getBalanceSubtitle,
  getSavingsSubtitle,
  sortByDateDesc,
  sumByType,
} from '../../utils/dashboardMetrics'
import { formatMonthYear, formatSoles } from '../../utils/financeFormat'
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

  const now = useMemo(() => new Date(), [])
  const monthLabel = formatMonthYear(now)

  const [monthIncome, setMonthIncome] = useState<ReturnType<typeof sortByDateDesc>>([])
  const [monthExpense, setMonthExpense] = useState<ReturnType<typeof sortByDateDesc>>([])
  const [totals, setTotals] = useState({ income: 0, expense: 0 })
  const [balance, setBalance] = useState(0)
  const [savingsPercent, setSavingsPercent] = useState(0)
  const [categoryExpenses, setCategoryExpenses] = useState<ReturnType<typeof buildCategoryExpenses>>([])
  const [monthlyChart, setMonthlyChart] = useState<ReturnType<typeof buildLast6MonthsChart>>([])
  const [recent, setRecent] = useState<ReturnType<typeof sortByDateDesc>>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchTransactions(), fetchCategories()])
      .then(([transactions, categories]) => {
        if (cancelled) return

        const categoryMap = buildCategoryMap(categories)
        const enriched = enrichTransactions(transactions, categoryMap)
        const monthTransactions = filterByMonth(enriched, now)
        const monthTotals = sumByType(monthTransactions)
        const monthBalance = monthTotals.income - monthTotals.expense

        setMonthIncome(sortByDateDesc(monthTransactions.filter((t) => t.tipo === 'income')))
        setMonthExpense(sortByDateDesc(monthTransactions.filter((t) => t.tipo === 'expense')))
        setTotals(monthTotals)
        setBalance(monthBalance)
        setSavingsPercent(computeSavingsPercent(monthTotals.income, monthTotals.expense))
        setCategoryExpenses(buildCategoryExpenses(monthTransactions.filter((t) => t.tipo === 'expense')))
        setMonthlyChart(buildLast6MonthsChart(enriched, now))
        setRecent(sortByDateDesc(enriched).slice(0, 8))
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
  }, [transactionsVersion, now])

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        {error}
      </section>
    )
  }

  return (
    <section className="space-y-6">
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
          amount={formatSoles(totals.income)}
          subtitle={monthLabel}
          variant="income"
          isActive={activeCard === 'income'}
          onClick={() => setActiveCard('income')}
        />
        <DashboardSummaryCard
          title="Gastos"
          amount={formatSoles(totals.expense)}
          subtitle={monthLabel}
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
        <DashboardMonthCard variant="income" transactions={monthIncome} loading={loading} />
        <DashboardMonthCard variant="expense" transactions={monthExpense} loading={loading} />
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
