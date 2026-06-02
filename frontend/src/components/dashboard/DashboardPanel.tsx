import { DashboardChartsSection } from './DashboardChartsSection'
import { DashboardMonthCard } from './DashboardMonthCard'
import { DashboardRecentTransactions } from './DashboardRecentTransactions'
import { DashboardSummaryCard } from './DashboardSummaryCard'

export function DashboardPanel() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardSummaryCard title="Balance" amount="S/ 0.00" subtitle="Vas bien 💪" variant="balance" />
        <DashboardSummaryCard title="Ingresos" amount="S/ 0.00" variant="income" />
        <DashboardSummaryCard title="Gastos" amount="S/ 0.00" variant="expense" />
        <DashboardSummaryCard title="Ahorro" amount="0%" subtitle="Meta: 20%" variant="savings" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardMonthCard variant="income" />
        <DashboardMonthCard variant="expense" />
      </div>

      <DashboardChartsSection />

      <DashboardRecentTransactions />
    </section>
  )
}
