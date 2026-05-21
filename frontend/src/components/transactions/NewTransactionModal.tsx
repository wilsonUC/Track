import { useMemo } from 'react'
import { mockCategories } from '../../data/mockCategories'
import type { MovementType } from '../../types/finance'

type NewTransactionModalProps = {
  open: boolean
  onClose: () => void
  movementType: MovementType
  onMovementTypeChange: (value: MovementType) => void
  amount: string
  onAmountChange: (value: string) => void
  categoryId: string
  onCategoryIdChange: (value: string) => void
  date: string
  onDateChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'

export function NewTransactionModal({
  open,
  onClose,
  movementType,
  onMovementTypeChange,
  amount,
  onAmountChange,
  categoryId,
  onCategoryIdChange,
  date,
  onDateChange,
  description,
  onDescriptionChange,
}: NewTransactionModalProps) {
  const currentCategory = useMemo(
    () => mockCategories.find((c) => c.id === categoryId) ?? mockCategories[mockCategories.length - 1],
    [categoryId],
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-center bg-white pt-3 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-slate-200" aria-hidden />
        </div>
        <div className="p-5 pb-6 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 id="modal-title" className="text-xl font-bold text-slate-900">
                Nueva transacción
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">Registra un ingreso o un gasto en tu cuenta.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Cerrar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onMovementTypeChange('expense')}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                movementType === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-600'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => onMovementTypeChange('income')}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                movementType === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-600'
              }`}
            >
              Ingreso
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Monto</span>
              <input
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="S/ 0.00"
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Categoría</span>
              <select
                value={categoryId}
                onChange={(e) => onCategoryIdChange(e.target.value)}
                className={inputClass}
              >
                {mockCategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.icon} {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Fecha</span>
              <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className={inputClass} />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Descripción (opcional)</span>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Ej.: pago del mes…"
                rows={3}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Categoría seleccionada: {currentCategory.icon} {currentCategory.name}
          </p>
        </div>
      </div>
    </div>
  )
}
