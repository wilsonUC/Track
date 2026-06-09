import { Download, Plus } from 'lucide-react'
import { sectionSubtitle, sectionTitle } from '../../constants/sectionLabels'
import type { Section } from '../../types/finance'
import { formatMonthYear } from '../../utils/financeFormat'

type MainHeaderProps = {
  section: Section
  displayName: string
  onOpenNewTransaction: () => void
}

export function MainHeader({ section, displayName, onOpenNewTransaction }: MainHeaderProps) {
  const isDashboard = section === 'dashboard'
  const monthLabel = formatMonthYear(new Date())

  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 space-y-1">
        {isDashboard ? (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              ¡Hola, {displayName}!
            </h2>
            <p className="text-sm text-slate-500">Resumen de {monthLabel.toLowerCase()}</p>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold capitalize tracking-tight text-slate-900 sm:text-3xl">
                {sectionTitle[section]}
              </h2>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 shadow-sm">
                {monthLabel}
              </span>
            </div>
            <p className="text-sm text-slate-500">{sectionSubtitle[section]}</p>
          </>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {isDashboard && (
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            Exportar
          </button>
        )}
        <button
          type="button"
          onClick={onOpenNewTransaction}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm ${
            isDashboard
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nueva transacción
        </button>
      </div>
    </header>
  )
}
