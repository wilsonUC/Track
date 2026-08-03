import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ApiAhorro } from '../../api/ahorros'
import { formatSoles } from '../../utils/financeFormat'

type AhorroModalProps = {
  open: boolean
  disponible: number
  onClose: () => void
  onSaved: () => void
  crearAhorro: (data: { monto: string; fecha: string; descripcion?: string }) => Promise<ApiAhorro>
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'

export function AhorroModal({ open, disponible, onClose, onSaved, crearAhorro }: AhorroModalProps) {
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [descripcion, setDescripcion] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setMonto('')
      setFecha(new Date().toISOString().slice(0, 10))
      setDescripcion('')
      setError('')
    }
  }, [open])

  async function handleSave() {
    setError('')
    const montoNum = Number(monto)
    if (!monto || montoNum <= 0) {
      setError('El monto debe ser mayor que cero.')
      return
    }
    if (montoNum > disponible) {
      setError(`Solo tienes ${formatSoles(disponible)} disponibles para apartar.`)
      return
    }
    if (!fecha) {
      setError('Elige una fecha.')
      return
    }

    setSaving(true)
    try {
      await crearAhorro({ monto, fecha, descripcion })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el ahorro.')
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
    >
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="p-5 pb-6 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Apartar ahorro</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Disponible: <span className="font-semibold">{formatSoles(disponible)}</span>
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

          <div className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Monto a apartar</span>
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

            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Descripción (opcional)</span>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej.: ahorro del mes"
                rows={2}
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
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Apartar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
