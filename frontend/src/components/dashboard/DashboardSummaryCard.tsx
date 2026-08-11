import { Wallet, TrendingUp, TrendingDown, PiggyBank, Landmark } from 'lucide-react'

type DashboardSummaryCardProps = {
  title: string
  amount: string
  subtitle?: string
  variant: 'balance' | 'income' | 'expense' | 'savings' | 'totalBalance'
  isActive?: boolean
  onClick?: () => void
}

function CardIcon({ variant }: { variant: DashboardSummaryCardProps['variant'] }) {
  const cls = 'h-5 w-5'
  if (variant === 'balance') return <Wallet className={cls} aria-hidden />
  if (variant === 'totalBalance') return <Landmark className={cls} aria-hidden />
  if (variant === 'income') return <TrendingUp className={cls} aria-hidden />
  if (variant === 'expense') return <TrendingDown className={cls} aria-hidden />
  return <PiggyBank className={cls} aria-hidden />
}

export function DashboardSummaryCard({ title, amount, subtitle, variant, isActive, onClick }: DashboardSummaryCardProps) {
  if (isActive) {
    let activeGradient = 'from-indigo-600 via-violet-600 to-indigo-700'
    if (variant === 'income') activeGradient = 'from-emerald-600 via-teal-600 to-emerald-700'
    if (variant === 'expense') activeGradient = 'from-rose-600 via-pink-600 to-rose-700'
    if (variant === 'savings') activeGradient = 'from-indigo-600 via-fuchsia-600 to-violet-700'
    if (variant === 'totalBalance') activeGradient = 'from-slate-700 via-slate-600 to-slate-800'

    return (
      <article
        onClick={onClick}
        className={`overflow-hidden rounded-2xl bg-gradient-to-br ${activeGradient} p-4 sm:p-5 text-white shadow-md cursor-pointer transform hover:scale-[1.01] transition-all duration-150`}
      >
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/80">{title}</p>
          <p className="mt-0.5 text-lg font-bold tracking-tight tabular-nums text-white sm:text-xl leading-tight">
            {amount}
          </p>
        </div>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <p className="text-xs font-semibold text-white/80 truncate">{subtitle || ' '}</p>
          <div className="shrink-0 rounded-xl bg-white/20 p-2 text-white shadow-sm">
            <CardIcon variant={variant} />
          </div>
        </div>
      </article>
    )
  }

  const iconBg =
    variant === 'income'
      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
      : variant === 'expense'
        ? 'bg-rose-50 text-rose-600 border border-rose-100/50'
        : variant === 'totalBalance'
          ? 'bg-slate-100 text-slate-600 border border-slate-200/50'
          : 'bg-indigo-50 text-indigo-600 border border-indigo-100/50'

  const amountColor =
    variant === 'income'
      ? 'text-emerald-600'
      : variant === 'expense'
        ? 'text-rose-600'
        : variant === 'totalBalance'
          ? 'text-slate-800'
          : 'text-slate-800'

  return (
    <article
      onClick={onClick}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-150 transform hover:scale-[1.01]"
    >
      <div>
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <p className={`mt-0.5 text-lg font-bold tracking-tight tabular-nums sm:text-xl leading-tight ${amountColor}`}>
          {amount}
        </p>
      </div>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <p className="text-xs font-semibold text-slate-400 truncate">{subtitle || ' '}</p>
        <div className={`shrink-0 rounded-xl p-2 ${iconBg}`}>
          <CardIcon variant={variant} />
        </div>
      </div>
    </article>
  )
}
