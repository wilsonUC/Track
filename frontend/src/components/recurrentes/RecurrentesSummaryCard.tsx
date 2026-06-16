import { RefreshCw } from 'lucide-react'

type RecurrentesSummaryCardProps = {
  totalPendienteGastos: number
  totalPendienteIngresos: number
}

export function RecurrentesSummaryCard({
  totalPendienteGastos,
  totalPendienteIngresos,
}: RecurrentesSummaryCardProps) {
  return (
    <article className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Gastos fijos por pagar
          </span>
          <div className="text-2xl font-black text-rose-500 sm:text-3xl">
            S/ {totalPendienteGastos.toFixed(2)}
          </div>
          <span className="block text-xs text-slate-500">
            Obligaciones de gasto aún no registradas este mes.
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ingresos fijos por cobrar
          </span>
          <div className="text-2xl font-black text-emerald-600 sm:text-3xl">
            S/ {totalPendienteIngresos.toFixed(2)}
          </div>
          <span className="block text-xs text-slate-500">
            Ingresos recurrentes que aún no marcaste como cobrados.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <RefreshCw className="h-5 w-5 shrink-0 text-indigo-600" aria-hidden />
        <p className="text-xs leading-relaxed text-slate-600">
          El estado de cada recurrente se reinicia solo al cambiar de mes: si no hay transacción
          registrada, vuelve a pendiente.
        </p>
      </div>
    </article>
  )
}
