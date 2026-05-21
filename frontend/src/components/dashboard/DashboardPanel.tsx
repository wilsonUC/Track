import { AmountCard } from './AmountCard'

export function DashboardPanel() {
  return (
    <section className="space-y-4">
      <p className="text-sm text-slate-600">
        Indicadores del mes. Los valores se actualizarán cuando conectes datos reales.
      </p>
      <div className="grid gap-4 md:grid-cols-4">
        <AmountCard title="Balance" amount="S/ 0.00" accent="text-blue-600" />
        <AmountCard title="Ingresos" amount="S/ 0.00" accent="text-emerald-600" />
        <AmountCard title="Gastos" amount="-S/ 0.00" accent="text-rose-600" />
        <AmountCard title="Ahorro" amount="0%" accent="text-indigo-600" />
      </div>
    </section>
  )
}
