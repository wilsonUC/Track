import { AlertCircle, Send } from 'lucide-react'
import type { IaCuota } from './iaTypes'

type IaChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  disabled?: boolean
  cuota?: IaCuota | null
}

export function IaChatInput({ value, onChange, onSubmit, disabled, cuota }: IaChatInputProps) {
  const limiteAgotado = Boolean(
    cuota && !cuota.es_ilimitado && cuota.restantes_hoy !== null && cuota.restantes_hoy <= 0,
  )

  return (
    <div className="border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {limiteAgotado && (
        <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <p className="font-semibold">Límite diario alcanzado (6 de 6 mensajes)</p>
            <p className="mt-0.5 text-amber-700/90 dark:text-amber-400/90">
              Has agotado tus consultas gratuitas de hoy para el Plan Básico. Tu cuota se reiniciará mañana o puedes solicitar un Plan Avanzado para mensajes ilimitados.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className={`flex gap-3 rounded-2xl border p-2 transition-all ${
          limiteAgotado
            ? 'border-slate-200 bg-slate-100 opacity-70 dark:border-slate-800 dark:bg-slate-800/50'
            : 'border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800'
        }`}
      >
        <input
          type="text"
          placeholder={
            limiteAgotado
              ? 'Límite de mensajes alcanzado por hoy…'
              : 'Pregunta sobre tus gastos, ingresos o ahorro…'
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-500"
          disabled={disabled || limiteAgotado}
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled || limiteAgotado}
          className="shrink-0 rounded-xl bg-indigo-600 p-3 text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 disabled:scale-100 disabled:opacity-30 dark:shadow-none"
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  )
}

