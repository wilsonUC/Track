import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

type FiltroMesRecurrentesProps = {
  fechaRef: Date
  onChangeFecha: (newDate: Date) => void
}

export function FiltroMesRecurrentes({ fechaRef, onChangeFecha }: FiltroMesRecurrentesProps) {
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
    d.setDate(1) // set to first of month
    onChangeFecha(d)
  }

  const esMesActual = () => {
    const hoy = new Date()
    return hoy.getMonth() === fechaRef.getMonth() && hoy.getFullYear() === fechaRef.getFullYear()
  }

  const mesTexto = `${MESES[fechaRef.getMonth()]} ${fechaRef.getFullYear()}`

  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 px-3 shadow-xs backdrop-blur-sm transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-slate-950/40 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      {/* Lado izquierdo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 sm:h-auto sm:w-auto sm:rounded-xl sm:p-2 sm:text-indigo-500">
          <Calendar className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 sm:text-sm sm:uppercase sm:tracking-wider">
            <span className="sm:hidden">Período</span>
            <span className="hidden sm:inline">Período de consulta</span>
          </h2>
          <p className="hidden text-xs text-slate-400 dark:text-slate-400 sm:block">
            Ver y registrar pagos/ingresos de este mes
          </p>
        </div>
      </div>

      {/* Lado derecho: Controles del mes */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={irAlMesActual}
          className={`mr-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-600 transition-colors hover:bg-indigo-100 active:scale-95 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs ${
            esMesActual() ? 'pointer-events-none w-0 !mr-0 overflow-hidden !px-0 opacity-0' : 'opacity-100'
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
    </div>
  )
}

