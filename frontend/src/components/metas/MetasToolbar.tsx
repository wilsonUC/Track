import { Plus } from 'lucide-react'

type MetasToolbarProps = {
  onNuevaMeta: () => void
}

export function MetasToolbar({ onNuevaMeta }: MetasToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Metas de ahorro</h2>
        <p className="mt-1 text-sm text-slate-500">
          Define objetivos y registra aportes desde tu dinero disponible.
        </p>
      </div>
      <button
        type="button"
        onClick={onNuevaMeta}
        className="flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Nueva meta
      </button>
    </div>
  )
}
