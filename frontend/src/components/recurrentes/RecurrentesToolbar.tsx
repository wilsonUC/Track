import { Plus } from 'lucide-react'

type RecurrentesToolbarProps = {
  onNuevoRecurrente: () => void
}

export function RecurrentesToolbar({ onNuevoRecurrente }: RecurrentesToolbarProps) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onNuevoRecurrente}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 sm:w-auto"
      >
        <Plus className="h-4 w-4" aria-hidden />
        <span>Nuevo recurrente</span>
      </button>
    </div>
  )
}
