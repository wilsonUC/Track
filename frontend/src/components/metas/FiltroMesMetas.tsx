import { ChevronLeft, ChevronRight, Calendar, Eye, Filter } from 'lucide-react'

type FiltroMesMetasProps = {
  fechaRef: Date
  onChangeFecha: (newDate: Date) => void
  mostrarTodas: boolean
  onToggleMostrarTodas: () => void
  totalMetas: number
  metasVisibles: number
}

export function FiltroMesMetas({
  fechaRef,
  onChangeFecha,
  mostrarTodas,
  onToggleMostrarTodas,
  totalMetas,
  metasVisibles,
}: FiltroMesMetasProps) {
  const MESES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]

  const retrocederMes = () => {
    const d = new Date(fechaRef)
    d.setMonth(d.getMonth() - 1)
    onChangeFecha(d)
  }

  const avanzarMes = () => {
    const d = new Date(fechaRef)
    d.setMonth(d.getMonth() + 1)
    onChangeFecha(d)
  }

  const irAlMesActual = () => {
    const d = new Date()
    d.setDate(1)
    onChangeFecha(d)
  }

  const esMesActual = () => {
    const hoy = new Date()
    return hoy.getMonth() === fechaRef.getMonth() && hoy.getFullYear() === fechaRef.getFullYear()
  }

  const mesTexto = `${MESES[fechaRef.getMonth()]} ${fechaRef.getFullYear()}`

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-2.5 px-3.5 shadow-xs backdrop-blur-sm transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-slate-950/40 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      {/* Lado izquierdo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 sm:h-10 sm:w-10 sm:rounded-xl sm:p-2 sm:text-indigo-500">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 sm:text-sm">
              <span className="sm:hidden">Período</span>
              <span className="hidden sm:inline">Período de consulta</span>
            </h2>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
              {mostrarTodas ? `${totalMetas} totales` : `${metasVisibles} de ${totalMetas}`}
            </span>
          </div>
          <p className="hidden text-xs text-slate-400 dark:text-slate-400 sm:block">
            {mostrarTodas
              ? 'Mostrando todas las metas registradas'
              : 'Metas activas y vigentes en este mes'}
          </p>
        </div>
      </div>

      {/* Lado derecho: Controles del mes y toggle */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:justify-end sm:gap-2">
        {/* Toggle para ver todas */}
        <button
          type="button"
          onClick={onToggleMostrarTodas}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-xs ${
            mostrarTodas
              ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
              : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-indigo-950/50'
          }`}
          title={mostrarTodas ? 'Filtrar por mes seleccionado' : 'Ver todas las metas'}
        >
          {mostrarTodas ? (
            <>
              <Filter className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Filtrar por mes</span>
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Ver todas</span>
            </>
          )}
        </button>

        {!mostrarTodas && (
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={irAlMesActual}
              className={`rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-600 transition-colors hover:bg-indigo-100 active:scale-95 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-xs ${
                esMesActual()
                  ? 'pointer-events-none w-0 !mr-0 overflow-hidden !px-0 opacity-0'
                  : 'opacity-100'
              }`}
            >
              Hoy
            </button>

            <button
              type="button"
              onClick={retrocederMes}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300 sm:h-9 sm:w-9 sm:rounded-xl sm:border sm:border-slate-100 sm:bg-slate-50 sm:dark:border-slate-800 sm:dark:bg-slate-800/80 sm:dark:hover:bg-indigo-950/50"
              title="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="min-w-[95px] text-center text-xs font-extrabold text-slate-700 dark:text-slate-200 sm:min-w-[120px] sm:text-sm">
              {mesTexto}
            </span>

            <button
              type="button"
              onClick={avanzarMes}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300 sm:h-9 sm:w-9 sm:rounded-xl sm:border sm:border-slate-100 sm:bg-slate-50 sm:dark:border-slate-800 sm:dark:bg-slate-800/80 sm:dark:hover:bg-indigo-950/50"
              title="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
