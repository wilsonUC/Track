import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react'
import {
  fetchInfoEliminacionRecurrente,
  type InfoEliminacionRecurrente,
} from '../../api/recurrentes'
import type { RecurrenteCardView } from './recurrentesTypes'

type EliminarRecurrenteModalProps = {
  open: boolean
  recurrente: RecurrenteCardView | null
  onClose: () => void
  onConfirm: (id: number, modo?: 'eliminar_todo' | 'conservar_transacciones') => Promise<void>
}

export function EliminarRecurrenteModal({
  open,
  recurrente,
  onClose,
  onConfirm,
}: EliminarRecurrenteModalProps) {
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [info, setInfo] = useState<InfoEliminacionRecurrente | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !recurrente) {
      setInfo(null)
      setError('')
      setDeleting(false)
      return
    }

    let cancelled = false
    setLoadingInfo(true)
    setError('')

    fetchInfoEliminacionRecurrente(recurrente.id)
      .then((data) => {
        if (!cancelled) setInfo(data)
      })
      .catch(() => {
        if (!cancelled) {
          setInfo({
            id: recurrente.id,
            nombre: recurrente.nombre,
            num_transacciones: 0,
            total_monto: 0,
          })
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingInfo(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, recurrente])

  if (!open || !recurrente) return null

  const handleEliminar = async () => {
    setDeleting(true)
    setError('')
    try {
      await onConfirm(recurrente.id, 'eliminar_todo')
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar el recurrente'
      setError(msg)
    } finally {
      setDeleting(false)
    }
  }

  const tieneTransacciones = info ? info.num_transacciones > 0 : false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <Trash2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Eliminar recurrente
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{recurrente.nombre}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {loadingInfo ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Verificando información…</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                ¿Estás seguro de que deseas eliminar permanentemente el recurrente{' '}
                <strong className="text-slate-900 dark:text-white">"{recurrente.nombre}"</strong>?
              </p>

              {tieneTransacciones ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <p className="text-[11px] leading-relaxed">
                      Este recurrente tiene <strong>{info?.num_transacciones} {info?.num_transacciones === 1 ? 'transacción registrada' : 'transacciones registradas'}</strong> (S/ {info?.total_monto.toFixed(2)}). Se eliminarán todas las transacciones asociadas y tu saldo se recalculará.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Esta acción eliminará la plantilla del recurrente de forma permanente.
                </p>
              )}
            </div>
          )}

          {error && <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={deleting || loadingInfo}
            onClick={handleEliminar}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? 'Eliminando…' : 'Eliminar permanentemente'}
          </button>
        </div>
      </div>
    </div>
  )
}
