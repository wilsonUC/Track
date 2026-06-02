import { sectionSubtitle, sectionTitle } from '../../constants/sectionLabels'
import type { Section } from '../../types/finance'

type MainHeaderProps = {
  section: Section
  onOpenNewTransaction: () => void
}

/** Nombre de ejemplo hasta conectar perfil del usuario */
const DISPLAY_NAME = 'GrLaz'

export function MainHeader({ section, onOpenNewTransaction }: MainHeaderProps) {
  const isDashboard = section === 'dashboard'

  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 space-y-1">
        {isDashboard ? (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              ¡Hola, {DISPLAY_NAME}!
            </h2>
            <p className="text-sm text-slate-500">Resumen de marzo 2026</p>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold capitalize tracking-tight text-slate-900 sm:text-3xl">
                {sectionTitle[section]}
              </h2>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 shadow-sm">
                Marzo 2026
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
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
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
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva transacción
        </button>
      </div>
    </header>
  )
}
