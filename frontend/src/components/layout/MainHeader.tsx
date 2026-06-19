import { Download, Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { sectionSubtitle, sectionTitle } from '../../constants/sectionLabels'
import { cuentaPath } from '../../constants/routes'
import type { Section } from '../../types/finance'

type MainHeaderProps = {
  section: Section
  displayName: string
  onOpenNewTransaction: () => void
}

export function MainHeader({ section, displayName, onOpenNewTransaction }: MainHeaderProps) {
  const { pathname } = useLocation()
  const isDashboard = section === 'dashboard'
  const isCuenta = pathname === cuentaPath

  return (
    <header className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 space-y-1">
        {isCuenta ? (
          <>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">Mi Cuenta</h2>
            <p className="text-sm text-slate-500">
              Visualiza y actualiza la información de tu perfil y preferencias de seguridad.
            </p>
          </>
        ) : isDashboard ? (
          <>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              ¡Hola, {displayName}!
            </h2>
            <p className="text-sm text-slate-500">Vista general de tus finanzas</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold capitalize tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              {sectionTitle[section]}
            </h2>
            <p className="text-sm text-slate-500">{sectionSubtitle[section]}</p>
          </>
        )}
      </div>

      {!isCuenta && (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          {isDashboard && (
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto"
            >
              <Download className="h-4 w-4" aria-hidden />
              Exportar
            </button>
          )}
          <button
            type="button"
            onClick={onOpenNewTransaction}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto ${
              isDashboard
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nueva transacción
          </button>
        </div>
      )}
    </header>
  )
}
