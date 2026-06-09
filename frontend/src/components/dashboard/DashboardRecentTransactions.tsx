import { ArrowDownRight, ArrowUpRight, History } from 'lucide-react'
import type { EnrichedTransaction } from '../../utils/dashboardMetrics'
import { formatShortDate, formatSignedSoles } from '../../utils/financeFormat'

type DashboardRecentTransactionsProps = {
  transactions: EnrichedTransaction[]
  loading?: boolean
}

export function DashboardRecentTransactions({ transactions, loading }: DashboardRecentTransactionsProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <History className="h-5 w-5" aria-hidden />
        </div>
        <h3 className="font-semibold text-slate-800">Todas las transacciones recientes</h3>
      </div>

      <div className="p-4 sm:p-5">
        {loading && <p className="py-8 text-center text-sm text-slate-500">Cargando…</p>}

        {!loading && transactions.length === 0 && (
          <div className="relative flex min-h-[160px] items-center justify-center">
            <p className="text-sm text-slate-500">No hay transacciones para mostrar</p>
          </div>
        )}

        {!loading && transactions.length > 0 && (
          <div className="max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            <ul className="divide-y divide-slate-100">
              {transactions.map((t) => {
                const isIncome = t.tipo === 'income'
                return (
                  <li key={t.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="h-4 w-4" aria-hidden />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {t.descripcion || 'Sin descripción'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                            {t.categoriaNombre}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatShortDate(t.fecha)}</span>
                        </div>
                      </div>
                    </div>
                    <p
                      className={`shrink-0 text-sm font-bold tabular-nums ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatSignedSoles(t.montoNum, isIncome)}
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
