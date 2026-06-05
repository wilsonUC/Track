import type { EnrichedTransaction } from '../../utils/dashboardMetrics'
import { formatShortDate, formatSignedSoles } from '../../utils/financeFormat'

type DashboardRecentTransactionsProps = {
  transactions: EnrichedTransaction[]
  loading?: boolean
}

export function DashboardRecentTransactions({ transactions, loading }: DashboardRecentTransactionsProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.172-.879-1.172-2.303 0-3.182C10.536 7.88 11.304 7.66 12 7.66c.768 0 1.536.22 2.121.659l.879.659"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-slate-800">Todas las transacciones recientes</h3>
      </div>

      <div className="p-5">
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
                        <svg
                          className="h-4.5 w-4.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          {isIncome ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25"
                            />
                          )}
                        </svg>
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
