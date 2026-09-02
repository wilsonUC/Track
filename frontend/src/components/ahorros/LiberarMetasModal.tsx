import { Loader2, PiggyBank, Target, X } from 'lucide-react'
import { useState } from 'react'
import { liberarMetaAhorro, liberarTodasMetasAhorro, type MetaAsignada } from '../../api/ahorros'
import { formatSoles } from '../../utils/financeFormat'

type LiberarMetasModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  metasAsignadas: MetaAsignada[]
  totalAsignado: number
  isAvanzado?: boolean
}

export function LiberarMetasModal({
  open,
  onClose,
  onSuccess,
  metasAsignadas,
  totalAsignado,
  isAvanzado = false,
}: LiberarMetasModalProps) {
  const [liberandoMetaId, setLiberandoMetaId] = useState<number | null>(null)
  const [liberandoTodo, setLiberandoTodo] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  async function handleLiberarMeta(metaId: number) {
    setError('')
    setLiberandoMetaId(metaId)
    try {
      await liberarMetaAhorro(metaId)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo liberar la meta.')
    } finally {
      setLiberandoMetaId(null)
    }
  }

  async function handleLiberarTodo() {
    setError('')
    setLiberandoTodo(true)
    try {
      await liberarTodasMetasAhorro()
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron liberar las metas.')
    } finally {
      setLiberandoTodo(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="liberar-metas-title"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <h3 id="liberar-metas-title" className="text-base font-bold text-slate-800 dark:text-slate-100">
                Metas con fondos asignados
              </h3>
              <p className="text-xs text-slate-400">
                Total asignado: <span className="font-bold text-violet-600 dark:text-violet-400">{formatSoles(totalAsignado)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {!isAvanzado
            ? 'En el Plan Básico no tienes acceso al módulo de Metas. Puedes retirar o devolver estos fondos a tu ahorro libre para disponer de ellos.'
            : 'Fondos vinculados a tus metas de ahorro. Puedes liberar montos de vuelta a tu fondo de ahorro libre.'}
        </p>

        {metasAsignadas.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              disabled={liberandoTodo || liberandoMetaId !== null}
              onClick={handleLiberarTodo}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-100 transition hover:bg-violet-700 disabled:opacity-60 dark:shadow-violet-950/40"
            >
              {liberandoTodo ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Liberando todas…</span>
                </>
              ) : (
                <span>Liberar todas a ahorro libre ({formatSoles(totalAsignado)})</span>
              )}
            </button>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            O liberar individualmente:
          </p>
          {metasAsignadas.length === 0 ? (
            <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800">
              No hay metas con saldo asignado.
            </div>
          ) : (
            <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {metasAsignadas.map((m) => {
                const montoNum = Number(m.monto)
                const isProcessing = liberandoMetaId === m.id
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        <Target className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{m.nombre}</p>
                        <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                          {formatSoles(montoNum)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={liberandoTodo || liberandoMetaId !== null}
                      onClick={() => handleLiberarMeta(m.id)}
                      className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-violet-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      {isProcessing ? 'Liberando…' : 'Liberar'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
