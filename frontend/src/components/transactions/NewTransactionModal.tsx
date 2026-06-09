import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  createTransaction,
  fetchCategories,
  type ApiCategory,
} from '../../api/finanzas'
import type { MovementType } from '../../types/finance'

type NewTransactionModalProps = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  movementType: MovementType
  onMovementTypeChange: (value: MovementType) => void
  amount: string
  onAmountChange: (value: string) => void
  categoryId: number | ''
  onCategoryIdChange: (value: number) => void
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
  onSaved,
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
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.tipo === movementType),
    [categories, movementType],
  )

  const currentCategory = useMemo(
    () => filteredCategories.find((c) => c.id === categoryId),
    [filteredCategories, categoryId],
  )

  // Cargar categorías globales al abrir el modal
  useEffect(() => {
    if (!open) return

    setError('')
    setLoadingCategories(true)
    fetchCategories()
      .then(setCategories)
      .catch(() => setError('No se pudieron cargar las categorías.'))
      .finally(() => setLoadingCategories(false))
  }, [open])

  // Al cambiar gasto/ingreso o al cargar categorías: elegir la primera del tipo
  useEffect(() => {
    if (!open || filteredCategories.length === 0) return

    const stillValid = filteredCategories.some((c) => c.id === categoryId)
    if (!stillValid) {
      onCategoryIdChange(filteredCategories[0].id)
    }
  }, [open, filteredCategories, categoryId, onCategoryIdChange])

  async function handleSave() {
    setError('')

    if (!categoryId) {
      setError('Elige una categoría.')
      return
    }
    if (!amount || Number(amount) <= 0) {
      setError('El monto debe ser mayor que cero.')
      return
    }
    if (!date) {
      setError('Elige una fecha.')
      return
    }

    setSaving(true)
    try {
      await createTransaction({
        categoria: categoryId,
        tipo: movementType,
        monto: amount,
        fecha: date,
        descripcion: description,
      })
      onSaved()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(message || 'No se pudo guardar la transacción.')
    } finally {
      setSaving(false)
    }
  }

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
              <X className="h-6 w-6" aria-hidden />
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
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Categoría</span>
              <select
                value={categoryId === '' ? '' : String(categoryId)}
                onChange={(e) => onCategoryIdChange(Number(e.target.value))}
                className={inputClass}
                disabled={loadingCategories || filteredCategories.length === 0}
              >
                {loadingCategories && <option value="">Cargando…</option>}
                {!loadingCategories && filteredCategories.length === 0 && (
                  <option value="">No hay categorías para este tipo</option>
                )}
                {filteredCategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
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

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loadingCategories}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>

          {currentCategory && (
            <p className="mt-3 text-xs text-slate-400">Categoría seleccionada: {currentCategory.nombre}</p>
          )}
        </div>
      </div>
    </div>
  )
}
