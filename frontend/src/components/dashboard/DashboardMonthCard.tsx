import { TrendingDown, TrendingUp } from 'lucide-react'
import type { MovementType } from '../../types/finance'
import type { EnrichedTransaction } from '../../utils/dashboardMetrics'
import { getCategoryDisplay } from '../../utils/categoryDisplay'
import { formatShortDate, formatSignedSoles } from '../../utils/financeFormat'

type DashboardMonthCardProps = {
  variant: MovementType
  transactions: EnrichedTransaction[]
  loading?: boolean
  periodLabel?: string
}

export function DashboardMonthCard({ variant, transactions, loading, periodLabel }: DashboardMonthCardProps) {
  const isIncome = variant === 'income'
  const title = isIncome ? 'Ingresos' : 'Gastos'
  const totalAmount = transactions.reduce((sum, item) => sum + item.montoNum, 0)
  const formattedTotal = formatSignedSoles(totalAmount, isIncome)
  const emptyText = isIncome ? 'Sin ingresos en el período' : 'Sin gastos en el período'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md duration-200">
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 sm:py-4 ${
          isIncome ? 'border-emerald-100 bg-emerald-50/10' : 'border-rose-100 bg-rose-50/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {isIncome ? (
              <TrendingUp className="h-5 w-5" aria-hidden />
            ) : (
              <TrendingDown className="h-5 w-5" aria-hidden />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            {periodLabel && <p className="text-xs text-slate-400">{periodLabel}</p>}
          </div>
        </div>
        <p className={`text-base font-bold tabular-nums sm:text-lg ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
          {formattedTotal}
        </p>
      </div>

      <div className="p-4">
        {loading && <p className="py-8 text-center text-sm text-slate-500">Cargando…</p>}

        {!loading && transactions.length === 0 && (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
            <p className="text-sm text-slate-500">{emptyText}</p>
          </div>
        )}

        {!loading && transactions.length > 0 && (
          <div className="max-h-[280px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            <ul className="flex flex-col gap-1.5">
              {transactions.map((item) => {
                const catInfo = getCategoryDisplay(item.categoriaNombre)
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl transition duration-150 hover:bg-slate-50/80 cursor-default"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${catInfo.bg}`}
                      >
                        {catInfo.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-700">
                          {item.descripcion || 'Sin descripción'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-all ${catInfo.badge}`}
                          >
                            {item.categoriaNombre}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{formatShortDate(item.fecha)}</span>
                        </div>
                      </div>
                    </div>
                    <p
                      className={`shrink-0 text-sm font-bold tabular-nums ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatSignedSoles(item.montoNum, isIncome)}
                    </p>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </article>
  )
}
