import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  createTransaction,
  updateTransaction,
  type ApiCategory,
} from '../../api/finanzas'
import {
  buildTransactionPayload,
  formValuesFromTransaction,
  type TransactionFormValues,
} from '../../utils/transactionPayload'
import type { EnrichedTransaction } from '../../utils/dashboardMetrics'

type TransactionEditModalProps = {
  open: boolean
  mode: 'edit' | 'duplicate'
  transaction: EnrichedTransaction | null
  categories: ApiCategory[]
  onClose: () => void
  onSaved: () => void
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'

export function TransactionEditModal({
  open,
  mode,
  transaction,
  categories,
  onClose,
  onSaved,
}: TransactionEditModalProps) {
  const [form, setForm] = useState<TransactionFormValues>({
    amount: '',
    date: '',
    description: '',
    categoryId: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isIncome = transaction?.tipo === 'income'
  const isDuplicate = mode === 'duplicate'
  const isManual = transaction ? !transaction.esPresupuesto && !transaction.esRecurrente : false

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.tipo === transaction?.tipo),
    [categories, transaction?.tipo],
  )

  useEffect(() => {
    if (!open || !transaction) return
    setForm(formValuesFromTransaction(transaction))
    setError('')
  }, [open, transaction])

  async function handleSave() {
    if (!transaction) return
    setError('')

    if (isManual && form.categoryId === '') {
      setError('Elige una categoría.')
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError('El monto debe ser mayor que cero.')
      return
    }
    if (!form.date) {
      setError('Elige una fecha.')
      return
    }

    const payload = buildTransactionPayload(transaction, form)

    setSaving(true)
    try {
      if (isDuplicate) {
        await createTransaction(payload)
      } else {
        await updateTransaction(transaction.id, payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(message || 'No se pudo guardar la transacción.')
    } finally {
      setSaving(false)
    }
  }

  if (!open || !transaction) return null

  const title = isDuplicate ? 'Duplicar transacción' : 'Editar transacción'
  const subtitle = isDuplicate
    ? 'Se creará un registro nuevo con los mismos datos. Ajusta monto o descripción si hace falta.'
    : 'Modifica los datos de este movimiento.'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-tx-title"
    >
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-center bg-white pt-3 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-slate-200" aria-hidden />
        </div>
        <div className="p-5 pb-6 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 id="edit-tx-title" className="text-xl font-bold text-slate-900">
                {title}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
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

          <div
            className={`mb-4 inline-flex rounded-lg px-3 py-1.5 text-xs font-bold ${
              isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {isIncome ? 'Ingreso' : 'Gasto'}
          </div>

          <div className="space-y-3">
            {transaction.esPresupuesto && (
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2.5 text-sm">
                <p className="text-xs text-indigo-600">Presupuesto</p>
                <p className="font-semibold text-indigo-900">{transaction.presupuestoNombre}</p>
              </div>
            )}

            {transaction.esRecurrente && (
              <div className="rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2.5 text-sm">
                <p className="text-xs text-violet-600">Recurrente</p>
                <p className="font-semibold text-violet-900">{transaction.recurrenteNombre}</p>
              </div>
            )}

            {isManual && (
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Categoría</span>
                <select
                  value={form.categoryId === '' ? '' : String(form.categoryId)}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, categoryId: Number(e.target.value) }))
                  }
                  className={inputClass}
                >
                  {filteredCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {!isManual && transaction.categoriaNombre && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                <p className="text-xs text-slate-500">Categoría</p>
                <p className="font-semibold text-slate-800">{transaction.categoriaNombre}</p>
              </div>
            )}

            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Monto</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Fecha</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Descripción</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
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
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : isDuplicate ? 'Crear copia' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
