import { Copy, Pencil, Trash2 } from 'lucide-react'

type TransactionRowActionsProps = {
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  disabled?: boolean
}

export function TransactionRowActions({
  onEdit,
  onDuplicate,
  onDelete,
  disabled = false,
}: TransactionRowActionsProps) {
  const buttonClass =
    'rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        className={buttonClass}
        aria-label="Editar"
        title="Editar"
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        disabled={disabled}
        className={buttonClass}
        aria-label="Duplicar"
        title="Duplicar"
      >
        <Copy className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className={`${buttonClass} hover:bg-rose-50 hover:text-rose-600`}
        aria-label="Eliminar"
        title="Eliminar"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
