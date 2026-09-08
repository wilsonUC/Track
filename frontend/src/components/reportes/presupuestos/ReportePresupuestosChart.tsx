import { BarChart3 } from 'lucide-react'
import type { PresupuestoReportItem } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReportePresupuestosChartProps = {
  items: PresupuestoReportItem[]
  loading?: boolean
}

export function ReportePresupuestosChart({ items, loading }: ReportePresupuestosChartProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Comparativa: Límite vs Gasto Real
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Nivel de ejecución por cada presupuesto activo
            </p>
          </div>
        </div>

        {/* Leyenda */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            &lt; 80%
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            80% - 100%
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            &gt; 100% (Excedido)
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-44 items-center justify-center text-sm text-slate-500">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/30">
          <p className="text-sm text-slate-400">No hay presupuestos creados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const barWidth = Math.min(100, item.porcentaje)
            const isExceeded = item.porcentaje >= 100
            const isAlert = item.porcentaje >= 80 && !isExceeded

            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {item.nombre}
                    {item.categoriaNombre && (
                      <span className="ml-2 font-normal text-slate-400 dark:text-slate-500">
                        ({item.categoriaNombre})
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {formatSoles(item.gastado)}{' '}
                      <span className="font-normal text-slate-400">/ {formatSoles(item.limite)}</span>
                    </span>
                    <span
                      className={`inline-flex min-w-[3.5rem] justify-end font-bold tabular-nums ${
                        isExceeded
                          ? 'text-rose-600 dark:text-rose-400'
                          : isAlert
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {item.porcentaje.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded
                        ? 'bg-rose-500'
                        : isAlert
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </article>
  )
}
