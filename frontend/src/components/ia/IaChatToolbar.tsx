import { RotateCcw, Sparkles } from 'lucide-react'

type IaChatToolbarProps = {
  onClear: () => void
  disabled?: boolean
}

export function IaChatToolbar({ onClear, disabled }: IaChatToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100">
        <Sparkles className="h-4 w-4" aria-hidden />
        <span>Powered by Groq</span>
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        Nueva conversación
      </button>
    </div>
  )
}
