import { PieChart } from 'lucide-react'
import { getTopCategoryInsight, type CategoryExpenseRow, type MonthChartPoint } from '../../utils/dashboardMetrics'
import { formatSoles } from '../../utils/financeFormat'
import { DashboardMonthlyChart } from './DashboardMonthlyChart'

type DashboardChartsSectionProps = {
  categoryExpenses: CategoryExpenseRow[]
  monthlyChart: MonthChartPoint[]
  loading?: boolean
}

export function DashboardChartsSection({ categoryExpenses, monthlyChart, loading }: DashboardChartsSectionProps) {
  const insight = getTopCategoryInsight(categoryExpenses)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <PieChart className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="font-semibold text-slate-800">Gastos por categoría</h3>
          </div>

          <div className="space-y-4 p-4 sm:p-6">
            {loading && <p className="py-12 text-center text-sm text-slate-500">Cargando…</p>}

            {!loading && categoryExpenses.length === 0 && (
              <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
                <p className="text-sm text-slate-500">No hay gastos este mes</p>
              </div>
            )}

            {!loading &&
              categoryExpenses.map((c) => (
                <div key={c.categoria} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${c.colorLight}`}>
                        {c.porcentaje}%
                      </span>
                      <span className="font-semibold text-slate-700">{c.categoria}</span>
                    </div>
                    <span className="font-bold text-slate-700">{formatSoles(c.monto)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${c.colorBg}`}
                      style={{ width: `${c.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {insight && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 rounded-b-2xl">
            <p className="text-xs text-slate-500 text-center">{insight}</p>
          </div>
        )}
      </article>

      <DashboardMonthlyChart data={monthlyChart} loading={loading} />
    </div>
  )
}
