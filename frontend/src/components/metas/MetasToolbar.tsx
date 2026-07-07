import { Plus } from 'lucide-react'

type MetasToolbarProps = {
  onNuevaMeta: () => void
}

export function MetasToolbar({ onNuevaMeta }: MetasToolbarProps) {
  return (
    <div className="flex justify-end border-b border-slate-200 pb-5">
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
