import { ChevronLeft, ChevronRight } from 'lucide-react'

type ReportesMonthHeaderProps = {
  refDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onResetToCurrent: () => void
  isCurrentMonth: boolean
}

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

export function ReportesMonthHeader({
  refDate,
  onPrevMonth,
  onNextMonth,
  onResetToCurrent,
  isCurrentMonth,
}: ReportesMonthHeaderProps) {
  const mesTexto = `${MESES[refDate.getMonth()]} ${refDate.getFullYear()}`

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        type="button"
        onClick={onResetToCurrent}
        className={`rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-100 active:scale-95 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 ${
          isCurrentMonth ? 'pointer-events-none w-0 overflow-hidden !px-0 opacity-0' : 'opacity-100'
        }`}
      >
        Hoy
      </button>

      <button
        type="button"
        onClick={onPrevMonth}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
        title="Mes anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="min-w-[110px] text-center text-xs font-extrabold text-slate-700 dark:text-slate-200 sm:text-sm">
        {mesTexto}
      </span>

      <button
        type="button"
        onClick={onNextMonth}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
        title="Mes siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
