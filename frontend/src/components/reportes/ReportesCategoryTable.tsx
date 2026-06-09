import type { ReportCategoryRow, ReportFilter } from './reportesTypes'

type ReportesCategoryTableProps = {
  filter: ReportFilter
  categories: ReportCategoryRow[]
}

export function ReportesCategoryTable({ filter, categories }: ReportesCategoryTableProps) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Desglose Detallado por Categoría</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Viendo {categories.length} registros basados en el filtro superior.
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-600">
          {filter}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 font-bold text-slate-400">
              <th className="w-2/5 pb-3">Categoría</th>
              <th className="pb-3 text-center">Tipo</th>
              <th className="pb-3 text-center">Peso Relativo</th>
              <th className="pr-4 pb-3 text-right">Total Acumulado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {categories.map((cat) => (
              <tr key={cat.nombre} className="transition-colors hover:bg-slate-50/70">
                <td className="flex items-center gap-2.5 py-3.5 font-semibold text-slate-700">
                  <span className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
                  {cat.nombre}
                </td>
                <td className="py-3.5 text-center">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      cat.tipo === 'ingreso' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {cat.tipo}
                  </span>
                </td>
                <td className="py-3.5 text-center font-bold text-slate-500">{cat.porcentaje}</td>
                <td
                  className={`py-3.5 pr-4 text-right font-black ${
                    cat.tipo === 'ingreso' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {cat.tipo === 'ingreso' ? '+' : '-'}
                  {cat.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
