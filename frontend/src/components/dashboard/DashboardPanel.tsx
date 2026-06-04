import { useState } from 'react'
import { DashboardChartsSection } from './DashboardChartsSection'
import { DashboardMonthCard } from './DashboardMonthCard'
import { DashboardRecentTransactions } from './DashboardRecentTransactions'
import { DashboardSummaryCard } from './DashboardSummaryCard'

export function DashboardPanel() {
  // Manejo de la tarjeta activa por defecto (inicia en Balance)
  const [activeCard, setActiveCard] = useState<'balance' | 'income' | 'expense' | 'savings'>('balance')

  return (
    <section className="space-y-6">
      {/* Grid de Tarjetas de Resumen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardSummaryCard
          title="Balance"
          amount="S/ 2,700.00"
          subtitle="¡Excelente balance! 💰"
          variant="balance"
          isActive={activeCard === 'balance'}
          onClick={() => setActiveCard('balance')}
        />
        <DashboardSummaryCard
          title="Ingresos"
          amount="S/ 5,100.00"
          subtitle="Marzo 2026"
          variant="income"
          isActive={activeCard === 'income'}
          onClick={() => setActiveCard('income')}
        />
        <DashboardSummaryCard
          title="Gastos"
          amount="S/ 2,400.00"
          subtitle="Marzo 2026"
          variant="expense"
          isActive={activeCard === 'expense'}
          onClick={() => setActiveCard('expense')}
        />
        <DashboardSummaryCard
          title="Ahorro"
          amount="53%"
          subtitle="Meta: 20% | ¡Superada! 🚀"
          variant="savings"
          isActive={activeCard === 'savings'}
          onClick={() => setActiveCard('savings')}
        />
      </div>

      {/* Tarjetas Mensuales de Detalle */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardMonthCard variant="income" />
        <DashboardMonthCard variant="expense" />
      </div>

      {/* Gráfico Mensual */}
      <DashboardChartsSection />

      {/* Transacciones Recientes */}
      <DashboardRecentTransactions />
    </section>
  )
}
