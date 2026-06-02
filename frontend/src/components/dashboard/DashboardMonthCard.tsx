type DashboardMonthCardProps = {
  variant: 'income' | 'expense'
}

export function DashboardMonthCard({ variant }: DashboardMonthCardProps) {
  const isIncome = variant === 'income'
  const title = isIncome ? 'Ingresos del mes' : 'Gastos del mes'
  const amount = isIncome ? '+S/ 0.00' : '-S/ 0.00'
  const emptyText = isIncome ? 'Sin ingresos este mes' : 'Sin gastos este mes'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${
          isIncome ? 'border-emerald-100' : 'border-rose-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              {isIncome ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9.75 12 2.25 6v4.5L12 12 2.25 15V18z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 18l-7.5-6 7.5-6v4.5L12 12l9.75 3V18z" />
              )}
            </svg>
          </div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <p className={`text-lg font-bold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
          {amount}
        </p>
      </div>
      <div className="p-5">
        <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
          <p className="text-sm text-slate-500">{emptyText}</p>
        </div>
      </div>
    </article>
  )
}
