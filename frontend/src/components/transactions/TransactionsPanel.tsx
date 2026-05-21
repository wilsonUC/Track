import type { Section } from '../../types/finance'

type TransactionsPanelProps = {
  section: Extract<Section, 'ingresos' | 'gastos'>
}

export function TransactionsPanel({ section }: TransactionsPanelProps) {
  const isIncome = section === 'ingresos'

  return (
    <section className="space-y-4">
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Total de marzo 2026</p>
        <p className={`mt-2 text-4xl font-bold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isIncome ? '+S/ 0.00' : '-S/ 0.00'}
        </p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          {isIncome
            ? 'Aquí verás la suma de todos los ingresos registrados en el periodo.'
            : 'Aquí verás la suma de todos los gastos registrados en el periodo.'}
        </p>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-400 shadow-sm">
        <p className="text-base font-medium text-slate-600">No hay transacciones aún</p>
        <p className="mt-1 text-sm text-slate-500">
          Cuando registres movimientos desde el botón «Nueva transacción», aparecerán listados aquí.
        </p>
      </article>
    </section>
  )
}
