import { BarChart3 } from 'lucide-react'
import type { MonthlyBarData, ReportFilter } from './reportesTypes'

type ReportesMonthlyChartProps = {
  filter: ReportFilter
  data: MonthlyBarData[]
  loading?: boolean
}

function chartTitle(filter: ReportFilter) {
  if (filter === 'ingresos') return 'Solo Ingresos'
  if (filter === 'gastos') return 'Solo Gastos'
  return 'Ingresos vs Gastos'
}

function hasVisibleData(data: MonthlyBarData[], showIncome: boolean, showExpense: boolean) {
  return data.some((bar) => (showIncome && bar.ing > 0) || (showExpense && bar.gas > 0))
}

export function ReportesMonthlyChart({ filter, data, loading }: ReportesMonthlyChartProps) {
  const showIncome = filter === 'todos' || filter === 'ingresos'
  const showExpense = filter === 'todos' || filter === 'gastos'
  const empty = !loading && !hasVisibleData(data, showIncome, showExpense)

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

      {loading && (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500">Cargando…</div>
      )}

      {empty && (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
          <p className="text-sm text-slate-500">Sin movimientos en los últimos 6 meses</p>
        </div>
      )}

      {!loading && !empty && (
        <div className="flex h-48 items-end justify-between border-b border-slate-100 px-2 pb-2 sm:px-6">
          {data.map((bar) => (
            <div key={bar.mes} className="flex w-10 flex-col items-center gap-2 sm:w-12">
              <div className="flex h-36 w-full items-end justify-center gap-1.5 sm:gap-2">
                {showIncome && (
                  <div
                    className="group relative w-3.5 cursor-pointer rounded-t-sm bg-emerald-400 transition-all duration-300 hover:bg-emerald-500 sm:w-4"
                    style={{ height: `${Math.max(bar.ingPercent, bar.ing > 0 ? 4 : 0)}%` }}
                  >
                    {bar.ing > 0 && (
                      <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                        S/ {bar.ing.toLocaleString('es-PE')}
                      </div>
                    )}
                  </div>
                )}
                {showExpense && (
                  <div
                    className="group relative w-3.5 cursor-pointer rounded-t-sm bg-rose-400 transition-all duration-300 hover:bg-rose-500 sm:w-4"
                    style={{ height: `${Math.max(bar.gasPercent, bar.gas > 0 ? 4 : 0)}%` }}
                  >
                    {bar.gas > 0 && (
                      <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                        S/ {bar.gas.toLocaleString('es-PE')}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-400">{bar.mes}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
