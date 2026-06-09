import { BarChart3 } from 'lucide-react'
import type { MonthlyBarData, ReportFilter } from './reportesTypes'

type ReportesMonthlyChartProps = {
  filter: ReportFilter
  data: MonthlyBarData[]
}

function chartTitle(filter: ReportFilter) {
  if (filter === 'ingresos') return 'Solo Ingresos'
  if (filter === 'gastos') return 'Solo Gastos'
  return 'Ingresos vs Gastos'
}

export function ReportesMonthlyChart({ filter, data }: ReportesMonthlyChartProps) {
  const showIncome = filter === 'todos' || filter === 'ingresos'
  const showExpense = filter === 'todos' || filter === 'gastos'

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" aria-hidden />
          <h2 className="text-sm font-bold text-slate-800">Historial: {chartTitle(filter)}</h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          {showIncome && (
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Ingresos
            </div>
          )}
          {showExpense && (
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-400" />
              Gastos
            </div>
          )}
        </div>
      </div>

      <div className="flex h-48 items-end justify-between border-b border-slate-100 px-6 pb-2">
        {data.map((bar) => (
          <div key={bar.mes} className="flex w-12 flex-col items-center gap-2">
            <div className="flex h-36 w-full items-end justify-center gap-2">
              {showIncome && (
                <div
                  className={`${bar.hIng} group relative w-4 cursor-pointer rounded-t-sm bg-emerald-400 transition-all duration-300 hover:bg-emerald-500`}
                >
                  <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    S/ {bar.ing}
                  </div>
                </div>
              )}
              {showExpense && (
                <div
                  className={`${bar.hGas} group relative w-4 cursor-pointer rounded-t-sm bg-rose-400 transition-all duration-300 hover:bg-rose-500`}
                >
                  <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    S/ {bar.gas}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400">{bar.mes}</span>
          </div>
        ))}
      </div>
    </article>
  )
}
