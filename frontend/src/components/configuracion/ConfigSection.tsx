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
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700/30 sm:px-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        {badge && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
            {badge}
          </span>
        )}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700/30">{children}</div>
    </article>
  )
}
