type DashboardSummaryCardProps = {
  title: string
  amount: string
  subtitle?: string
  variant: 'balance' | 'income' | 'expense' | 'savings'
}

function CardIcon({ variant }: { variant: DashboardSummaryCardProps['variant'] }) {
  const className = 'h-5 w-5'
  if (variant === 'balance') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
      </svg>
    )
  }
  if (variant === 'income') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-6-15-6v4.5L19.5 12 4.5 15v4.5z" />
      </svg>
    )
  }
  if (variant === 'expense') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 6 15 6v-4.5L4.5 12 19.5 9V4.5z" />
      </svg>
    )
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.172-.879-1.172-2.303 0-3.182C10.536 7.88 11.304 7.66 12 7.66c.768 0 1.536.22 2.121.659l.879.659" />
    </svg>
  )
}

export function DashboardSummaryCard({ title, amount, subtitle, variant }: DashboardSummaryCardProps) {
  if (variant === 'balance') {
    return (
      <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-5 text-white shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-100">{title}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums sm:text-4xl">{amount}</p>
            {subtitle && <p className="mt-1 text-sm text-indigo-100">{subtitle}</p>}
          </div>
          <div className="rounded-xl bg-white/15 p-2.5 text-white">
            <CardIcon variant={variant} />
          </div>
        </div>
      </article>
    )
  }

  const iconBg =
    variant === 'income'
      ? 'bg-emerald-50 text-emerald-600'
      : variant === 'expense'
        ? 'bg-rose-50 text-rose-600'
        : 'bg-indigo-50 text-indigo-600'

  const amountColor =
    variant === 'income'
      ? 'text-emerald-600'
      : variant === 'expense'
        ? 'text-rose-600'
        : 'text-indigo-700'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className={`mt-2 text-3xl font-bold tabular-nums ${amountColor}`}>{amount}</p>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 ${iconBg}`}>
          <CardIcon variant={variant} />
        </div>
      </div>
    </article>
  )
}
