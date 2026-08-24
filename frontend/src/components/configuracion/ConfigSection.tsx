import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type ConfigSectionProps = {
  icon: LucideIcon
  iconClass: string
  title: string
  subtitle: string
  badge?: string
  children: ReactNode
}

export function ConfigSection({
  icon: Icon,
  iconClass,
  title,
  subtitle,
  badge,
  children,
}: ConfigSectionProps) {
  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all dark:border-slate-800/80 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800/80 sm:px-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
        {badge && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
            {badge}
          </span>
        )}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/70">{children}</div>
    </article>
  )
}
