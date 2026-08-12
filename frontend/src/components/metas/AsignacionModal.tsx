import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatSoles } from '../../utils/financeFormat'
import type { MetaCardView } from '../../utils/metasDisplay'

type AsignacionModalProps = {
  open: boolean
  mode: 'asignar' | 'desasignar'
  meta: MetaCardView | null
  /** Ahorro libre disponible para asignar. */
  libre: number
  permitirAsignacionDirecta?: boolean
  saving?: boolean
  error?: string
  onClose: () => void
  onSubmit: (monto: string) => void
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'

export function AsignacionModal({
  open,
  mode,
  meta,
  libre,
  permitirAsignacionDirecta = false,
  saving,
  error,
  onClose,
  onSubmit,
}: AsignacionModalProps) {
  const [monto, setMonto] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (open) {
      setMonto('')
      setLocalError('')
    }
  }, [open])

  if (!open || !meta) return null

  const esAsignar = mode === 'asignar'
  const restanteMeta = Math.max(0, meta.objetivo - meta.acumulado)
  const topeAsignar = permitirAsignacionDirecta
    ? (restanteMeta > 0 ? restanteMeta : Number.MAX_SAFE_INTEGER)
    : Math.min(libre, restanteMeta)
  const tope = esAsignar ? topeAsignar : meta.acumulado

  function handleSubmit() {
    setLocalError('')
    const montoNum = Number(monto)
    if (!monto || montoNum <= 0) {
      setLocalError('El monto debe ser mayor que cero.')
      return
    }
    if (montoNum > tope + 0.0001) {
      setLocalError(
        esAsignar
          ? permitirAsignacionDirecta
            ? `Máximo asignable: ${formatSoles(tope)} (monto pendiente para la meta).`
            : `Máximo asignable: ${formatSoles(tope)} (ahorro libre o lo que falta para la meta).`
          : `Máximo a quitar: ${formatSoles(tope)}.`,
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
                {esAsignar ? 'Asignar a la meta' : 'Quitar asignación'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Meta: <span className="font-semibold">{meta.nombre}</span>
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
            {esAsignar ? (
              permitirAsignacionDirecta ? (
                <>
                  <span className="font-semibold text-indigo-600">Asignación libre activa</span> · Falta para la meta: <span className="font-bold">{formatSoles(restanteMeta)}</span>
                </>
              ) : (
                <>
                  Ahorro libre: <span className="font-bold">{formatSoles(libre)}</span> · Falta para la meta: <span className="font-bold">{formatSoles(restanteMeta)}</span>
                </>
              )
            ) : (
              <>
                Asignado actualmente: <span className="font-bold">{formatSoles(meta.acumulado)}</span>
              </>
            )}
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">
              Monto a {esAsignar ? 'asignar' : 'quitar'}
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
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                esAsignar ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {saving ? 'Guardando…' : esAsignar ? 'Asignar' : 'Quitar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
