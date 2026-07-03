import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type SettingsCardProps = {
  icon: LucideIcon
  iconClassName: string
  title: string
  description: string
  badge?: string
  children: ReactNode
}

export function SettingsCard({
  icon: Icon,
  iconClassName,
  title,
  description,
  badge,
  children,
}: SettingsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{title}</h3>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
          {badge && (
            <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </article>
  )
}
