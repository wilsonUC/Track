import { AlertTriangle, Loader2, PowerOff, X } from 'lucide-react'
import { formatSoles } from '../../utils/financeFormat'
import type { RecurrenteCardView } from './recurrentesTypes'

type DesactivarRecurrenteModalProps = {
  open: boolean
  recurrente: RecurrenteCardView | null
  desactivando?: boolean
  error?: string
  onClose: () => void
  onConfirm: (id: number) => Promise<void>
}

export function DesactivarRecurrenteModal({
  open,
  recurrente,
  desactivando = false,
  error = '',
  onClose,
  onConfirm,
}: DesactivarRecurrenteModalProps) {
  if (!open || !recurrente) return null

  const handleConfirm = async () => {
    await onConfirm(recurrente.id)
  }

  const esGasto = recurrente.tipo === 'expense'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <PowerOff className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Desactivar recurrente
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-[220px]">
                {recurrente.nombre}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={desactivando}
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
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1 text-[11.5px] leading-relaxed">
                <p className="font-bold">
                  ¿Deseas pausar este servicio recurrente?
                </p>
                <p className="text-amber-800 dark:text-amber-300/90">
                  Dejará de figurar como pendiente cada mes, pero <strong>todos tus registros de {esGasto ? 'pagos' : 'ingresos'} pasados se conservarán intactos</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Resumen del recurrente */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs dark:border-slate-800/80 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Concepto</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                {recurrente.nombre}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Monto estimado</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatSoles(recurrente.monto)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Día programado</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Día {recurrente.diaPago} de cada mes
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-400 leading-normal">
            Podrás reactivarlo cuando lo necesites activando la casilla <em>"Mostrar inactivos"</em>.
          </p>

          {error && (
            <p className="rounded-lg bg-rose-50 p-2.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            disabled={desactivando}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={desactivando}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 disabled:opacity-50 transition-all"
          >
            {desactivando ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Desactivando…</span>
              </>
            ) : (
              <>
                <PowerOff className="h-3.5 w-3.5" />
                <span>Desactivar recurrente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
