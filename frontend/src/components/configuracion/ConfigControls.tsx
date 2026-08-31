import type { ReactNode } from 'react'
import { CustomSelect, type CustomSelectOption } from '../ui/CustomSelect'

type ConfigRowProps = {
  label: string
  hint?: string
  children: ReactNode
  disabled?: boolean
}

export function ConfigRow({ label, hint, children, disabled = false }: ConfigRowProps) {
  return (
    <div
      className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${disabled ? 'opacity-60' : ''
        }`}
    >
      <div className="min-w-0 sm:max-w-[55%]">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
      <div className="shrink-0 sm:min-w-[210px]">{children}</div>
    </div>
  )
}

type ConfigToggleProps = {
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  label: string
}

export function ConfigToggle({ checked, onChange, disabled = false, label }: ConfigToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed ${checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
        }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform dark:bg-slate-200 dark:shadow-none ${checked ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
    </button>
  )
}

const selectClass =
  'w-full appearance-none rounded-xl border border-slate-300 bg-white pl-3.5 pr-10 py-2.5 text-sm font-medium text-slate-800 shadow-xs transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100 dark:shadow-none dark:disabled:bg-slate-800/40 dark:disabled:text-slate-500 cursor-pointer'

type ConfigSelectProps = {
  value: string
  onChange: (value: string) => void
  options: CustomSelectOption<string>[]
  disabled?: boolean
}

export function ConfigSelect({ value, onChange, options, disabled = false }: ConfigSelectProps) {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
    />
  )
}

type ConfigSegmentedProps = {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}

export function ConfigSegmented({ value, onChange, options, disabled = false }: ConfigSegmentedProps) {
  return (
    <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-900/70">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${value === opt.value
              ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-200 dark:shadow-none'
              : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            } disabled:cursor-not-allowed`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export { selectClass }
