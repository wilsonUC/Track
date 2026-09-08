import { Repeat } from 'lucide-react'
import type { RecurrenteReportItem } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReporteRecurrentesTableProps = {
  items: RecurrenteReportItem[]
  loading?: boolean
}

export function ReporteRecurrentesTable({ items, loading }: ReporteRecurrentesTableProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Desglose detallado de pagos recurrentes
            </h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {loading
                ? 'Cargando recurrentes…'
                : `${items.length} ${items.length === 1 ? 'compromiso registrado' : 'compromisos registrados'}`}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Cargando recurrentes…</div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/30">
          <p className="text-sm text-slate-400">No hay pagos recurrentes registrados</p>
        </div>
      ) : (
        <>
          {/* Mobile view */}
          <div className="space-y-3 md:hidden">
            {items.map((r) => {
              const isExpense = r.tipo === 'expense'

              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{r.nombre}</h3>
                      <p className="text-xs text-slate-400">
                        {r.categoriaNombre} · Día {r.diaPago}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        r.estadoPago === 'pagado'
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : r.estadoPago === 'vencido'
                            ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400'
                            : r.estadoPago === 'parcial'
                              ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
                              : 'border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {r.estadoPago}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400">Monto Mes</span>
                      <p
                        className={`font-bold ${
                          isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {formatSoles(r.montoMes)}
                      </p>
                    </div>
                    {r.montoPagado > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400">Abonado</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatSoles(r.montoPagado)}</p>
                      </div>
                    )}
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
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3 text-center">Tipo</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-center">Día de Corte</th>
                  <th className="px-4 py-3 text-right">Monto Mes</th>
                  <th className="px-4 py-3 text-right">Abonado / Pagado</th>
                  <th className="px-4 py-3 text-center">Ajuste Mensual</th>
                  <th className="px-4 py-3 text-center">Estado de Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {items.map((r) => {
                  const isExpense = r.tipo === 'expense'

                  return (
                    <tr
                      key={r.id}
                      className="bg-white/60 transition-colors hover:bg-white dark:bg-transparent dark:hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                        {r.nombre}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            isExpense
                              ? 'border border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                              : 'border border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                          }`}
                        >
                          {isExpense ? 'Gasto' : 'Ingreso'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {r.categoriaNombre}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                        Día {r.diaPago}
                      </td>
                      <td
                        className={`px-4 py-3.5 text-right font-bold tabular-nums ${
                          isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {formatSoles(r.montoMes)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-600 dark:text-slate-300">
                        {r.montoPagado > 0 ? formatSoles(r.montoPagado) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {r.tieneAjusteMes ? (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            Ajustado
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            r.estadoPago === 'pagado'
                              ? 'border border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : r.estadoPago === 'vencido'
                                ? 'border border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400'
                                : r.estadoPago === 'parcial'
                                  ? 'border border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
                                  : 'border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {r.estadoPago}
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
