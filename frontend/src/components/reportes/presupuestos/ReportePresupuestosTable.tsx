import { CreditCard } from 'lucide-react'
import type { PresupuestoReportItem } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReportePresupuestosTableProps = {
  items: PresupuestoReportItem[]
  loading?: boolean
}

export function ReportePresupuestosTable({ items, loading }: ReportePresupuestosTableProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Desglose detallado por presupuesto
            </h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {loading
                ? 'Cargando presupuestos…'
                : `${items.length} ${items.length === 1 ? 'presupuesto' : 'presupuestos'}`}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Cargando datos…</div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/30">
          <p className="text-sm text-slate-400">No hay presupuestos disponibles</p>
        </div>
      ) : (
        <>
          {/* Mobile view */}
          <div className="space-y-3 md:hidden">
            {items.map((item) => {
              const isExceeded = item.estado === 'excedido'
              const isAlert = item.estado === 'alerta'

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{item.nombre}</h3>
                      <p className="text-xs text-slate-400">{item.categoriaNombre || 'Sin categoría fija'}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        isExceeded
                          ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400'
                          : isAlert
                            ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}
                    >
                      {item.estado}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400">Límite</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{formatSoles(item.limite)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Gastado</span>
                      <p className="font-semibold text-rose-600 dark:text-rose-400">{formatSoles(item.gastado)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">{isExceeded ? 'Exceso' : 'Disponible'}</span>
                      <p
                        className={`font-semibold ${
                          isExceeded
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {formatSoles(Math.abs(item.disponible))}
                      </p>
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
                  <th className="px-4 py-3">Presupuesto</th>
                  <th className="px-4 py-3">Categoría de Ref.</th>
                  <th className="px-4 py-3 text-right">Límite</th>
                  <th className="px-4 py-3 text-right">Gastado</th>
                  <th className="px-4 py-3 text-right">Disponible / Exceso</th>
                  <th className="px-4 py-3 text-center">% Consumo</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {items.map((item) => {
                  const isExceeded = item.estado === 'excedido'
                  const isAlert = item.estado === 'alerta'

                  return (
                    <tr
                      key={item.id}
                      className="bg-white/60 transition-colors hover:bg-white dark:bg-transparent dark:hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                        {item.nombre}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        {item.categoriaNombre || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-700 dark:text-slate-200">
                        {formatSoles(item.limite)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-rose-600 dark:text-rose-400">
                        {formatSoles(item.gastado)}
                      </td>
                      <td
                        className={`px-4 py-3.5 text-right font-bold tabular-nums ${
                          isExceeded
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isExceeded ? '-' : '+'}
                        {formatSoles(Math.abs(item.disponible))}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold tabular-nums text-slate-700 dark:text-slate-300">
                        {item.porcentaje.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isExceeded
                              ? 'border border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                              : isAlert
                                ? 'border border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                                : 'border border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                          }`}
                        >
                          {item.estado}
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
