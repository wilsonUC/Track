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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-sm transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-slate-950/40">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Período de consulta</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400">Ver y registrar pagos/ingresos de este mes</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={irAlMesActual}
          className={`mr-1 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100 active:scale-95 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 ${
            esMesActual() ? 'pointer-events-none w-0 !mr-0 overflow-hidden !px-0 opacity-0' : 'opacity-100'
          }`}
        >
          Hoy
        </button>

        <button
          type="button"
          onClick={retrocederMes}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
          title="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="min-w-[120px] text-center text-sm font-extrabold text-slate-700 dark:text-slate-200">
          {mesTexto}
        </span>

        <button
          type="button"
          onClick={avanzarMes}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
          title="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
