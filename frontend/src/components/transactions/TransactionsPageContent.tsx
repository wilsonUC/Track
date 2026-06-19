import { History, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchCategories, fetchTransactions, type ApiCategory } from '../../api/finanzas'
import { CategoryFilterSelect } from '../filters/CategoryFilterSelect'
import { DateFilterToolbar } from '../filters/DateFilterToolbar'
import { useDateFilter } from '../../hooks/useDateFilter'
import { getCategoryDisplay } from '../../utils/categoryDisplay'
import {
  buildCategoryMap,
  enrichTransactions,
  filterByDateRange,
  sortByDateDesc,
  type EnrichedTransaction,
} from '../../utils/dashboardMetrics'
import { formatShortDate, formatSignedSoles } from '../../utils/financeFormat'

type TransactionsPageContentProps = {
  variant: 'income' | 'expense'
}

type OutletContext = {
  transactionsVersion: number
}

export function TransactionsPageContent({ variant }: TransactionsPageContentProps) {
  const { transactionsVersion } = useOutletContext<OutletContext>()
  const isIncome = variant === 'income'

  const [allTransactions, setAllTransactions] = useState<EnrichedTransaction[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const dateFilter = useDateFilter({ defaultPreset: 'total' })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchTransactions(), fetchCategories()])
      .then(([data, cats]) => {
        if (cancelled) return
        const categoryMap = buildCategoryMap(cats)
        const enriched = enrichTransactions(data, categoryMap)
        const filtered = enriched.filter((t) => t.tipo === variant)
        setAllTransactions(sortByDateDesc(filtered))
        setCategories(cats)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar las transacciones.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [variant, transactionsVersion])

  const transactions = useMemo(() => {
    let result = filterByDateRange(allTransactions, dateFilter.range)
    if (categoryId !== '') {
      result = result.filter((t) => t.categoria === categoryId)
    }
    return sortByDateDesc(result)
  }, [allTransactions, dateFilter.range, categoryId])

  const total = useMemo(
    () => transactions.reduce((sum, t) => sum + t.montoNum, 0),
    [transactions],
  )

  const summaryLabel = isIncome ? 'Total de ingresos' : 'Total de gastos'
  const historyTitle = isIncome ? 'Historial de ingresos' : 'Historial de gastos'
  const emptyText = isIncome ? 'No hay ingresos para mostrar' : 'No hay gastos para mostrar'

  return (
    <section className="space-y-4">
      <DateFilterToolbar
        preset={dateFilter.preset}
        onPresetChange={dateFilter.setPreset}
        customStart={dateFilter.customStart}
        customEnd={dateFilter.customEnd}
        onCustomStartChange={dateFilter.setCustomStart}
        onCustomEndChange={dateFilter.setCustomEnd}
      />

      <CategoryFilterSelect
        categories={categories}
        value={categoryId}
        onChange={setCategoryId}
        variant={variant}
      />

      <article
        className={`rounded-2xl border bg-white shadow-sm ${
          isIncome ? 'border-emerald-100' : 'border-rose-100'
        }`}
      >
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
              <p className="text-sm text-slate-500">{summaryLabel}</p>
              <p className="text-xs text-slate-400">
                {transactions.length} {transactions.length === 1 ? 'movimiento' : 'movimientos'} ·{' '}
                {dateFilter.label}
              </p>
            </div>
          </div>
          <p
            className={`text-2xl font-bold tabular-nums sm:text-3xl ${
              isIncome ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatSignedSoles(total, isIncome)}
          </p>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <History className="h-5 w-5" aria-hidden />
          </div>
          <h3 className="font-semibold text-slate-800">{historyTitle}</h3>
        </div>

        <div className="p-4">
          {loading && <p className="py-8 text-center text-sm text-slate-500">Cargando…</p>}
          {error && <p className="py-8 text-center text-sm text-red-600">{error}</p>}

          {!loading && !error && transactions.length === 0 && (
            <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
              <p className="text-sm text-slate-500">{emptyText}</p>
            </div>
          )}

          {!loading && !error && transactions.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {transactions.map((t) => {
                const displayName = t.esPresupuesto
                  ? (t.presupuestoNombre ?? 'Presupuesto')
                  : t.esRecurrente
                    ? (t.recurrenteNombre ?? 'Recurrente')
                    : t.categoriaNombre
                const catInfo = getCategoryDisplay(displayName)
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-xl p-2.5 transition duration-150 hover:bg-slate-50/80"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${catInfo.bg}`}
                      >
                        {catInfo.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-700">
                          {t.descripcion || 'Sin descripción'}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {t.esPresupuesto ? (
                            <span className="inline-block rounded-md border border-indigo-100 bg-indigo-50/70 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                              Presupuesto · {t.presupuestoNombre}
                            </span>
                          ) : t.esRecurrente ? (
                            <span className="inline-block rounded-md border border-violet-100 bg-violet-50/70 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                              Recurrente · {t.recurrenteNombre}
                            </span>
                          ) : (
                            <span
                              className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold ${catInfo.badge}`}
                            >
                              {t.categoriaNombre}
                            </span>
                          )}
                          <span className="text-[10px] font-medium text-slate-400">
                            {formatShortDate(t.fecha)}
                          </span>
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
          )}
        </div>
      </article>
    </section>
  )
}
