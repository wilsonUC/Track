import { ArrowDownRight, ArrowUpRight, History } from 'lucide-react'
import type { EnrichedTransaction } from '../../utils/dashboardMetrics'
import { formatShortDate, formatSignedSoles } from '../../utils/financeFormat'
import { getCategoryDisplay } from '../../utils/categoryDisplay'

type DashboardRecentTransactionsProps = {
  transactions: EnrichedTransaction[]
  loading?: boolean
}

export function DashboardRecentTransactions({ transactions, loading }: DashboardRecentTransactionsProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/40 dark:bg-slate-900/60">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-700/30 sm:px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
          <History className="h-5 w-5" aria-hidden />
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Todas las transacciones recientes</h3>
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
            <ul className="divide-y divide-slate-100 dark:divide-slate-700/30">
              {transactions.map((t) => {
                const isIncome = t.tipo === 'income'
                const isSaving = t.tipo === 'saving'
                const catInfo = !t.esPresupuesto && !t.esRecurrente && !t.esAhorro
                  ? getCategoryDisplay(t.categoriaNombre)
                  : null
                return (
                  <li key={t.id} className="list-row-compact flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      {catInfo ? (
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-transparent dark:ring-white/5 ${catInfo.bg}`}
                        >
                          {catInfo.icon}
                        </div>
                      ) : (
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-transparent dark:ring-white/5 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                              : isSaving
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="h-4 w-4" aria-hidden />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" aria-hidden />
                          )}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {t.descripcion || 'Sin descripción'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {t.esPresupuesto ? (
                            <span className="inline-block rounded border border-indigo-100 bg-indigo-50/70 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300">
                              Presupuesto · {t.presupuestoNombre}
                            </span>
                          ) : t.esRecurrente ? (
                            <span className="inline-block rounded border border-violet-100 bg-violet-50/70 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300">
                              Recurrente · {t.recurrenteNombre}
                            </span>
                          ) : t.esAhorro ? (
                            <span className="inline-block rounded border border-sky-100 bg-sky-50/70 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300">
                              Ahorro
                            </span>
                          ) : catInfo ? (
                            <span
                              className={`inline-block rounded border px-2 py-0.5 text-[10px] font-medium ${catInfo.badge}`}
                            >
                              {t.categoriaNombre}
                            </span>
                          ) : (
                            <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-700/50 dark:text-slate-300">
                              {t.categoriaNombre}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">{formatShortDate(t.fecha)}</span>
                        </div>
                      </div>
                    </div>
                    <p
                      className={`shrink-0 text-sm font-bold tabular-nums ${
                        isIncome ? 'text-emerald-600' : isSaving ? 'text-indigo-600' : 'text-rose-600'
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
