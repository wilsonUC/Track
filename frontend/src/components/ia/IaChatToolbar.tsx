import { MessageSquare, RotateCcw, Sparkles } from 'lucide-react'
import type { IaCuota } from './iaTypes'

type IaChatToolbarProps = {
  onClear: () => void
  disabled?: boolean
  cuota?: IaCuota | null
}

export function IaChatToolbar({ onClear, disabled, cuota }: IaChatToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100">
          <Sparkles className="h-4 w-4" aria-hidden />
          <span>Track IA</span>
        </div>

        {cuota && (
          cuota.es_ilimitado ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Plan Avanzado · Mensajes ilimitados</span>
            </div>
          ) : (
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                (cuota.restantes_hoy ?? 0) === 0
                  ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300'
                  : (cuota.restantes_hoy ?? 0) <= 2
                  ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>
                {cuota.restantes_hoy !== null
                  ? `${cuota.restantes_hoy} de ${cuota.limite_diario} mensajes hoy`
                  : `${cuota.usados_hoy} mensajes usados hoy`}
              </span>
            </div>
          )
        )}
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        Nueva conversación
      </button>
    </div>
  )
}

