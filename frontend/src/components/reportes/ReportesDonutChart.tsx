import { PieChart } from 'lucide-react'
import type { ReportFilter } from './reportesTypes'

type ReportesDonutChartProps = {
  filter: ReportFilter
}

function donutBorderClass(filter: ReportFilter) {
  if (filter === 'ingresos') return 'border-emerald-400 border-t-teal-500'
  if (filter === 'gastos') return 'border-rose-400 border-t-violet-500 border-r-amber-500'
  return 'border-indigo-500 border-t-rose-500 border-r-emerald-500'
}

export function ReportesDonutChart({ filter }: ReportesDonutChartProps) {
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <PieChart className="h-5 w-5 text-indigo-600" aria-hidden />
        <h2 className="text-sm font-bold text-slate-800">Distribución de Impacto</h2>
      </div>

      <div className="my-2 flex items-center justify-center">
        <div
          className={`flex h-32 w-32 rotate-45 items-center justify-center rounded-full border-[14px] transition-all duration-300 ${donutBorderClass(filter)}`}
        >
          <div className="-rotate-45 text-center">
            <span className="block text-xs font-extrabold capitalize text-slate-700">{filter}</span>
            <span className="text-[10px] font-medium text-slate-400">Filtrado</span>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] font-medium text-slate-400">
        Mostrando las categorías con mayor movimiento.
      </p>
    </article>
  )
}
