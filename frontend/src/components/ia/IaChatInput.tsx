import { Send } from 'lucide-react'

type IaChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  disabled?: boolean
}

export function IaChatInput({ value, onChange, onSubmit, disabled }: IaChatInputProps) {
  return (
    <div className="border-t border-slate-100 bg-white p-4">
      <form
        onSubmit={onSubmit}
        className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
      >
        <input
          type="text"
          placeholder="Pregunta sobre tus gastos, ingresos o ahorro…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="shrink-0 rounded-xl bg-indigo-600 p-3 text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 disabled:scale-100 disabled:opacity-30"
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  )
}
