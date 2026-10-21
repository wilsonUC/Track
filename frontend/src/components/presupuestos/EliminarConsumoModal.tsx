import { AlertTriangle, Loader2, RotateCcw, Trash2, X } from 'lucide-react'
import { useState } from 'react'

export type EliminarConsumoTarget =
  | {
      tipo: 'individual'
      consumoId: number
      monto: number
      fecha: string
      presupuestoId: number
      presupuestoNombre: string
    }
  | {
      tipo: 'todos'
      presupuestoId: number
      presupuestoNombre: string
      totalMonto: number
      totalConsumos: number
    }

type EliminarConsumoModalProps = {
  open: boolean
  target: EliminarConsumoTarget | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function EliminarConsumoModal({
  open,
  target,
  onClose,
  onConfirm,
}: EliminarConsumoModalProps) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  if (!open || !target) return null

  const esIndividual = target.tipo === 'individual'

  const handleConfirmar = async () => {
    setProcesando(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo quitar el gasto.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              {esIndividual ? (
                <Trash2 className="h-4 w-4" aria-hidden />
              ) : (
                <RotateCcw className="h-4 w-4" aria-hidden />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {esIndividual ? 'Quitar gasto de presupuesto' : 'Quitar gastos del mes'}
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-[220px]">
                {target.presupuestoNombre}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">
                  {esIndividual
                    ? '¿Deseas quitar este gasto ingresado?'
                    : '¿Deseas limpiar todos los consumos ingresados este mes?'}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {esIndividual
                    ? 'Esta acción eliminará la transacción registrada y reducirá el monto gastado de este presupuesto.'
                    : 'Se eliminarán todas las transacciones vinculadas a este presupuesto en el período seleccionado y el saldo gastado volverá a S/ 0.00.'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-2 dark:border-slate-800 dark:bg-slate-800/50">
            {esIndividual ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Monto del consumo:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  S/ {target.monto.toFixed(2)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Gastos a eliminar:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {target.totalConsumos} registro{target.totalConsumos !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total acumulado:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    S/ {target.totalMonto.toFixed(2)}
                  </span>
                </div>
              </>
            )}
            {esIndividual && target.fecha && (
              <div className="flex items-center justify-between text-xs border-t border-slate-200/50 pt-2 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Fecha de registro:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {target.fecha.slice(8, 10)}/{target.fecha.slice(5, 7)}/{target.fecha.slice(0, 4)}
                </span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={procesando}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-60"
          >
            {procesando ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Quitando…</span>
              </>
            ) : (
              <span>{esIndividual ? 'Quitar gasto' : 'Limpiar gastos'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
