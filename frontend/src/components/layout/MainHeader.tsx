import { sectionSubtitle, sectionTitle } from '../../constants/sectionLabels'
import type { Section } from '../../types/finance'

type MainHeaderProps = {
  section: Section
  onOpenNewTransaction: () => void
}

export function MainHeader({ section, onOpenNewTransaction }: MainHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold capitalize tracking-tight text-slate-900 sm:text-3xl">
            {sectionTitle[section]}
          </h2>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 shadow-sm">
            Marzo 2026
          </span>
        </div>
        <p className="text-sm text-slate-500">{sectionSubtitle[section]}</p>
      </div>
      <button
        type="button"
        onClick={onOpenNewTransaction}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Nueva transacción
      </button>
    </header>
  )
}
