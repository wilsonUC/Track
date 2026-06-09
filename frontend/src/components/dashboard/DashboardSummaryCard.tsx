import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'

type DashboardSummaryCardProps = {
  title: string
  amount: string
  subtitle?: string
  variant: 'balance' | 'income' | 'expense' | 'savings'
  isActive?: boolean
  onClick?: () => void
}

function CardIcon({ variant }: { variant: DashboardSummaryCardProps['variant'] }) {
  const cls = 'h-5 w-5'
  if (variant === 'balance') return <Wallet className={cls} aria-hidden />
  if (variant === 'income')  return <TrendingUp className={cls} aria-hidden />
  if (variant === 'expense') return <TrendingDown className={cls} aria-hidden />
  return <PiggyBank className={cls} aria-hidden />
}

export function DashboardSummaryCard({ title, amount, subtitle, variant, isActive, onClick }: DashboardSummaryCardProps) {
  if (isActive) {
    let activeGradient = 'from-indigo-600 via-violet-600 to-indigo-700'
    if (variant === 'income')  activeGradient = 'from-emerald-600 via-teal-600 to-emerald-700'
    if (variant === 'expense') activeGradient = 'from-rose-600 via-pink-600 to-rose-700'
    if (variant === 'savings') activeGradient = 'from-indigo-600 via-fuchsia-600 to-violet-700'

    return (
      <article
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${activeGradient} p-4 text-white shadow-md cursor-pointer transform hover:scale-[1.01] transition-all duration-150 sm:p-5`}
      >
        <div className="absolute top-4 right-4 rounded-xl bg-white/15 p-2.5 text-white">
          <CardIcon variant={variant} />
        </div>
        <div className="pr-12">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{title}</p>
          <p className="mt-2 text-xl font-bold tabular-nums sm:text-2xl">{amount}</p>
          {subtitle && <p className="mt-1 text-sm text-white/80 truncate">{subtitle}</p>}
        </div>
      </article>
    )
  }

  const iconBg =
    variant === 'income'
      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
      : variant === 'expense'
        ? 'bg-rose-50 text-rose-600 border border-rose-100/50'
        : 'bg-indigo-50 text-indigo-600 border border-indigo-100/50'

  const amountColor =
    variant === 'income'
      ? 'text-emerald-600'
      : variant === 'expense'
        ? 'text-rose-600'
        : 'text-slate-800'

  return (
    <article
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-150 transform hover:scale-[1.01] sm:p-5"
    >
      <div className={`absolute top-4 right-4 rounded-xl p-2.5 ${iconBg}`}>
        <CardIcon variant={variant} />
      </div>
      <div className="pr-12">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <p className={`mt-2 text-xl font-bold tabular-nums sm:text-2xl ${amountColor}`}>{amount}</p>
        {subtitle && <p className="mt-1 text-sm text-slate-500 truncate">{subtitle}</p>}
      </div>
    </article>
  )
}
