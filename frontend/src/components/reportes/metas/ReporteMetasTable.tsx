import { Target } from 'lucide-react'
import type { MetaReportItem } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReporteMetasTableProps = {
  items: MetaReportItem[]
  loading?: boolean
}

export function ReporteMetasTable({ items, loading }: ReporteMetasTableProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Desglose detallado por meta de ahorro
            </h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {loading
                ? 'Cargando metas…'
                : `${items.length} ${items.length === 1 ? 'meta registrada' : 'metas registradas'}`}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Cargando metas…</div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/30">
          <p className="text-sm text-slate-400">No hay metas registradas</p>
        </div>
      ) : (
        <>
          {/* Mobile view */}
          <div className="space-y-3 md:hidden">
            {items.map((m) => {
              const isCompleted = m.estado === 'completada' || m.porcentaje >= 100
              const isProgramada = m.estado === 'programada'
              const isVencida = m.estado === 'vencida'

              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{m.nombre}</h3>
                      <p className="text-xs text-slate-400">
                        {m.esAsignacionLibre ? 'Asignación libre' : 'Fondo de ahorro formal'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        isCompleted
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : isProgramada
                            ? 'border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400'
                            : isVencida
                              ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400'
                              : 'border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400'
                      }`}
                    >
                      {isCompleted ? 'Completada' : isProgramada ? 'Programada' : isVencida ? 'Vencida' : 'En curso'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400">Objetivo</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{formatSoles(m.montoObjetivo)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Acumulado</span>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatSoles(m.acumulado)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">Falta</span>
                      <p className="font-semibold text-slate-600 dark:text-slate-300">{formatSoles(m.faltante)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop view */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-100 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/30 md:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-white/70 font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-500">
                  <th className="px-4 py-3">Meta</th>
                  <th className="px-4 py-3">Tipo de Asignación</th>
                  <th className="px-4 py-3 text-right">Objetivo</th>
                  <th className="px-4 py-3 text-right">Acumulado</th>
                  <th className="px-4 py-3 text-right">Faltante</th>
                  <th className="px-4 py-3 text-center">Progreso</th>
                  <th className="px-4 py-3 text-center">Fecha Inicio</th>
                  <th className="px-4 py-3 text-center">Fecha Límite</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {items.map((m) => {
                  const isCompleted = m.estado === 'completada' || m.porcentaje >= 100
                  const isProgramada = m.estado === 'programada'
                  const isVencida = m.estado === 'vencida'

                  return (
                    <tr
                      key={m.id}
                      className="bg-white/60 transition-colors hover:bg-white dark:bg-transparent dark:hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                        {m.nombre}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {m.esAsignacionLibre ? 'Asignación libre' : 'Fondo formal'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-700 dark:text-slate-200">
                        {formatSoles(m.montoObjetivo)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatSoles(m.acumulado)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-500 dark:text-slate-400">
                        {formatSoles(m.faltante)}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold tabular-nums text-slate-700 dark:text-slate-300">
                        {m.porcentaje.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-500 dark:text-slate-400">
                        {m.fechaInicio || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-500 dark:text-slate-400">
                        {m.fechaLimite || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isCompleted
                              ? 'border border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                              : isProgramada
                                ? 'border border-violet-200/80 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300'
                                : isVencida
                                  ? 'border border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                                  : 'border border-indigo-200/80 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300'
                          }`}
                        >
                          {isCompleted ? 'Completada' : isProgramada ? 'Programada' : isVencida ? 'Vencida' : 'En curso'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </article>
  )
}
