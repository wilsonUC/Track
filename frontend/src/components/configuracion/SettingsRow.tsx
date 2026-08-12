import type { ReactNode } from 'react'

type SettingsRowProps = {
  label: string
  hint?: string
  children: ReactNode
  disabled?: boolean
}

export function SettingsRow({ label, hint, children, disabled = false }: SettingsRowProps) {
  return (
    <div
      className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${disabled ? 'opacity-60' : ''
        }`}
    >
      <div className="min-w-0 sm:max-w-[55%]">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
      <div className="shrink-0 sm:min-w-[200px] sm:text-right">{children}</div>
    </div>
  )
}
