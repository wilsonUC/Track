import type { ReportCategoryRow, ReportFilter } from './reportesTypes'

type ReportesCategoryTableProps = {
  filter: ReportFilter
  categories: ReportCategoryRow[]
  loading?: boolean
}

export function ReportesCategoryTable({ filter, categories, loading }: ReportesCategoryTableProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/40 dark:bg-slate-900/50 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Desglose detallado por categoría</h2>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            {loading
              ? 'Cargando registros…'
              : `Viendo ${categories.length} ${categories.length === 1 ? 'registro' : 'registros'} según el filtro.`}
          </p>
        </div>
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300">
          {filter}
        </span>
      </div>

      {loading && (
        <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Cargando…</div>
      )}

      {!loading && categories.length === 0 && (
        <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-700/40 dark:bg-slate-800/25">
          <p className="text-sm text-slate-500 dark:text-slate-400">No hay movimientos para este filtro</p>
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/40 dark:border-slate-700/30 dark:bg-slate-800/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-white/70 font-semibold text-slate-400 dark:border-slate-700/30 dark:bg-slate-900/30 dark:text-slate-500">
                  <th className="w-2/5 px-4 py-3">Categoría</th>
                  <th className="px-3 py-3 text-center">Tipo</th>
                  <th className="px-3 py-3 text-center">Peso relativo</th>
                  <th className="px-4 py-3 text-right">Total acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/25">
                {categories.map((cat) => (
                  <tr
                    key={`${cat.nombre}-${cat.tipo}`}
                    className="bg-white/60 transition-colors hover:bg-white dark:bg-transparent dark:hover:bg-slate-800/35"
                  >
                    <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-200">
                      <span className="inline-flex items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/80 dark:ring-slate-900/60 ${cat.color}`} />
                        {cat.nombre || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span
                        className={`inline-flex min-w-[4.5rem] items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          cat.tipo === 'ingreso'
                            ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-300'
                            : cat.tipo === 'ahorro'
                              ? 'border-teal-200/80 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/12 dark:text-teal-300'
                              : 'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/12 dark:text-rose-300'
                        }`}
                      >
                        {cat.tipo}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center font-semibold text-slate-500 dark:text-slate-400">
                      {cat.porcentaje}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right font-bold tabular-nums ${
                        cat.tipo === 'ingreso'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : cat.tipo === 'ahorro'
                            ? 'text-teal-600 dark:text-teal-400'
                            : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {cat.tipo === 'ingreso' ? '+' : cat.tipo === 'gasto' ? '-' : ''}
                      {cat.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </article>
  )
}
