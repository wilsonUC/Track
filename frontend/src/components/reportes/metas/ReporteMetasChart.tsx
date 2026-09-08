import { Target } from 'lucide-react'
import type { MetaReportItem } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReporteMetasChartProps = {
  items: MetaReportItem[]
  loading?: boolean
}

export function ReporteMetasChart({ items, loading }: ReporteMetasChartProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Progreso de metas de ahorro
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Avance porcentual hacia cada objetivo
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-44 items-center justify-center text-sm text-slate-500">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/30">
          <p className="text-sm text-slate-400">No hay metas de ahorro registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const isCompleted = item.porcentaje >= 100 || item.estado === 'completada'
            const isProgramada = item.estado === 'programada'
            const isVencida = item.estado === 'vencida'

            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{item.nombre}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {item.esAsignacionLibre ? 'Asignación libre' : 'Fondo de ahorro'}
                    </span>
                    {isProgramada && item.fechaInicio && (
                      <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:border-violet-800/60 dark:bg-violet-950/50 dark:text-violet-300">
                        Inicia: {item.fechaInicio}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {formatSoles(item.acumulado)}{' '}
                      <span className="font-normal text-slate-400">/ {formatSoles(item.montoObjetivo)}</span>
                    </span>
                    <span
                      className={`inline-flex min-w-[3.5rem] justify-end font-bold tabular-nums ${
                        isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isProgramada
                            ? 'text-violet-600 dark:text-violet-400'
                            : isVencida
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-indigo-600 dark:text-indigo-400'
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
                      isCompleted
                        ? 'bg-emerald-500'
                        : isProgramada
                          ? 'bg-violet-500'
                          : isVencida
                            ? 'bg-rose-500'
                            : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.max(item.porcentaje, isProgramada && item.porcentaje === 0 ? 0 : item.porcentaje)}%` }}
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
