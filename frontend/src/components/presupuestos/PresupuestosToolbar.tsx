import { Plus } from 'lucide-react'

type PresupuestosToolbarProps = {
  onNuevoPresupuesto: () => void
}

export function PresupuestosToolbar({ onNuevoPresupuesto }: PresupuestosToolbarProps) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onNuevoPresupuesto}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 sm:w-auto"
      >
        <Plus className="h-4 w-4" aria-hidden />
        <span>Nuevo presupuesto</span>
      </button>
    </div>
  )
}
