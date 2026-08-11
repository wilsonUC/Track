import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatSoles } from '../../utils/financeFormat'
import type { RecurrenteCardView } from './recurrentesTypes'

type AbonoRecurrenteModalProps = {
  open: boolean
  recurrente: RecurrenteCardView | null
  saving?: boolean
  error?: string
  onClose: () => void
  onSubmit: (monto: string) => void
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'

export function AbonoRecurrenteModal({
  open,
  recurrente,
  saving,
  error,
  onClose,
  onSubmit,
}: AbonoRecurrenteModalProps) {
  const [monto, setMonto] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (open && recurrente) {
      const restante = Math.max(0, recurrente.monto - recurrente.montoPagado)
      setMonto(restante > 0 ? restante.toFixed(2) : '')
      setLocalError('')
    }
  }, [open, recurrente])

  if (!open || !recurrente) return null

  const esIngreso = recurrente.tipo === 'income'
  const restante = Math.max(0, recurrente.monto - recurrente.montoPagado)

  function handleSubmit() {
    setLocalError('')
    const montoNum = Number(monto)
    if (!monto || montoNum <= 0) {
      setLocalError('El monto debe ser mayor que cero.')
      return
    }
    if (montoNum > restante + 0.0001) {
      setLocalError(
        `El monto ingresado no puede superar el saldo restante (${formatSoles(restante)}).`,
      )
      return
    }
    onSubmit(monto)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="p-5 pb-6 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {esIngreso ? 'Registrar cobro' : 'Asignar abono'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {esIngreso ? 'Ingreso fijo' : 'Gasto fijo'}: <span className="font-semibold text-slate-700">{recurrente.nombre}</span>
              </p>
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

          <div className="mb-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
            {esIngreso ? 'Cobrado' : 'Abonado'} este mes: <span className="font-bold text-slate-700">{formatSoles(recurrente.montoPagado)}</span> · Falta por registrar: <span className="font-bold text-indigo-650">{formatSoles(restante)}</span>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">
              {esIngreso ? 'Monto a registrar' : 'Monto a abonar'}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
          </label>

          {(localError || error) && (
            <p className="mt-3 text-sm text-red-600">{localError || error}</p>
          )}

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
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : esIngreso ? 'Registrar' : 'Abonar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
