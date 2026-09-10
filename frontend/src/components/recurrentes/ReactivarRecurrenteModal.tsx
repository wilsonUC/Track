import { useState, useEffect, type FormEvent } from 'react'
import { AlertCircle, Power, RefreshCw, X } from 'lucide-react'
import type { RecurrenteCardView } from './recurrentesTypes'

type ReactivarRecurrenteModalProps = {
  open: boolean
  recurrente: RecurrenteCardView | null
  mesInicial: string // 'YYYY-MM'
  saving?: boolean
  error?: string
  onClose: () => void
  onConfirm: (data: {
    fecha_inicio: string
    fecha_fin: string | null
    monto: string
    desvincular_transacciones: boolean
  }) => void
}

export function ReactivarRecurrenteModal({
  open,
  recurrente,
  mesInicial,
  saving,
  error,
  onClose,
  onConfirm,
}: ReactivarRecurrenteModalProps) {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [monto, setMonto] = useState('')

  useEffect(() => {
    if (open && recurrente) {
      setFechaInicio(mesInicial || '')
      setFechaFin('')
      setMonto(String(recurrente.monto || ''))
    }
  }, [open, recurrente, mesInicial])

  if (!open || !recurrente) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!fechaInicio || !monto) return

    onConfirm({
      fecha_inicio: `${fechaInicio}-01`,
      fecha_fin: fechaFin ? `${fechaFin}-01` : null,
      monto,
      desvincular_transacciones: true,
    })
  }

  const esIngreso = recurrente.tipo === 'income'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {esIngreso ? 'Reactivar ingreso fijo' : 'Reactivar gasto fijo'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-400">
                {recurrente.nombre}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            <div className="flex items-start gap-2.5">
              <Power className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="space-y-1 text-[11.5px] leading-relaxed">
                <p className="font-bold">
                  Inicia un nuevo ciclo limpio
                </p>
                <p className="text-emerald-800 dark:text-emerald-300/90">
                  Tus registros y pagos anteriores no se borran; se conservan seguros en tu historial general.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Comienza en
              </label>
              <input
                type="month"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Termina en
              </label>
              <input
                type="month"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Monto mensual (S/)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-100 transition-all hover:bg-emerald-700 disabled:opacity-60 dark:shadow-none"
            >
              <Power className="h-3.5 w-3.5" />
              <span>{saving ? 'Reactivando…' : 'Reactivar recurrente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
