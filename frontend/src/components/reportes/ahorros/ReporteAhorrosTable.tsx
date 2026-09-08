import { PiggyBank } from 'lucide-react'
import type { AhorroMovimientoRow } from '../reportesTypes'

type ReporteAhorrosTableProps = {
  movimientos: AhorroMovimientoRow[]
  loading?: boolean
}

export function ReporteAhorrosTable({ movimientos, loading }: ReporteAhorrosTableProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Historial de aportes al fondo de ahorro
            </h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {loading
                ? 'Cargando registros…'
                : `${movimientos.length} ${movimientos.length === 1 ? 'aporte registrado' : 'aportes registrados'}`}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Cargando movimientos…</div>
      ) : movimientos.length === 0 ? (
        <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/30">
          <p className="text-sm text-slate-400">No hay aportes de ahorro registrados</p>
        </div>
      ) : (
        <>
          {/* Vista Móvil */}
          <div className="space-y-2.5 md:hidden">
            {movimientos.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {m.descripcion}
                  </span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{m.montoFormatted}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{m.fecha}</span>
                  <span className="rounded-md bg-teal-50 px-2 py-0.5 font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    Aporte
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Vista Escritorio */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-100 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/30 md:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-white/70 font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-500">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Descripción / Concepto</th>
                  <th className="px-4 py-3 text-center">Tipo</th>
                  <th className="px-4 py-3 text-right">Monto Guardado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {movimientos.map((m) => (
                  <tr
                    key={m.id}
                    className="bg-white/60 transition-colors hover:bg-white dark:bg-transparent dark:hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                      {m.fecha}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      {m.descripcion}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full border border-teal-200/80 bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300">
                        Ahorro
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-teal-600 dark:text-teal-400">
                      +{m.montoFormatted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </article>
  )
}
