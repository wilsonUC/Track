import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchTransactions, type ApiTransaction } from '../../api/finanzas'

type TransactionsPageContentProps = {
  variant: 'income' | 'expense'
}

type OutletContext = {
  transactionsVersion: number
}

function formatMoney(value: number, isIncome: boolean) {
  const formatted = value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return isIncome ? `+S/ ${formatted}` : `-S/ ${formatted}`
}

export function TransactionsPageContent({ variant }: TransactionsPageContentProps) {
  const { transactionsVersion } = useOutletContext<OutletContext>()
  const isIncome = variant === 'income'
  const apiTipo = variant

  const [transactions, setTransactions] = useState<ApiTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchTransactions()
      .then((data) => setTransactions(data.filter((t) => t.tipo === apiTipo)))
      .catch(() => setError('No se pudieron cargar las transacciones.'))
      .finally(() => setLoading(false))
  }, [apiTipo, transactionsVersion])

  const total = useMemo(
    () => transactions.reduce((sum, t) => sum + Number(t.monto), 0),
    [transactions],
  )

  const monthLabel = isIncome ? 'Ingresos de marzo 2026' : 'Gastos de marzo 2026'
  const historyTitle = isIncome ? 'Historial de ingresos' : 'Historial de gastos'

  return (
    <section className="space-y-4">
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">{monthLabel}</p>
        <p
          className={`mt-2 text-4xl font-bold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}
        >
          {formatMoney(total, isIncome)}
        </p>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-base font-medium text-slate-600">{historyTitle}</p>

        {loading && <p className="mt-4 text-center text-sm text-slate-500">Cargando…</p>}
        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

        {!loading && !error && transactions.length === 0 && (
          <p className="mt-4 text-center text-sm text-slate-500">No hay transacciones para mostrar</p>
        )}

        {!loading && !error && transactions.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">
                    {t.descripcion || 'Sin descripción'}
                  </p>
                  <p className="text-xs text-slate-500">{t.fecha}</p>
                </div>
                <p
                  className={`shrink-0 font-semibold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  {formatMoney(Number(t.monto), isIncome)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}
