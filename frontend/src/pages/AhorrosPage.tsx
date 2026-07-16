import { History, Loader2, PiggyBank, Trash2, Wallet } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  crearAhorro,
  eliminarAhorro,
  fetchAhorros,
  fetchResumenAhorros,
  type ApiAhorro,
  type ResumenAhorros,
} from '../api/ahorros'
import { AhorroModal } from '../components/ahorros/AhorroModal'
import { formatShortDate, formatSoles } from '../utils/financeFormat'

type OutletContext = {
  transactionsVersion: number
  bumpTransactions: () => void
  setSecondaryHeaderAction: (action: { label: string; onClick: () => void } | null) => void
}

export function AhorrosPage() {
  const { transactionsVersion, bumpTransactions, setSecondaryHeaderAction } =
    useOutletContext<OutletContext>()
  const [ahorros, setAhorros] = useState<ApiAhorro[]>([])
  const [resumen, setResumen] = useState<ResumenAhorros | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [lista, res] = await Promise.all([fetchAhorros(), fetchResumenAhorros()])
      setAhorros(lista)
      setResumen(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los ahorros.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar, transactionsVersion])

  async function handleEliminar(ahorro: ApiAhorro) {
    if (!window.confirm(`¿Eliminar este ahorro de ${formatSoles(Number(ahorro.monto))}?`)) return
    setActionError('')
    setEliminandoId(ahorro.id)
    try {
      await eliminarAhorro(ahorro.id)
      bumpTransactions()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo eliminar.')
    } finally {
      setEliminandoId(null)
    }
  }

  const disponible = resumen ? Number(resumen.disponible ?? resumen.disponible_mes ?? 0) : 0

  useEffect(() => {
    setSecondaryHeaderAction({
      label: 'Apartar ahorro',
      onClick: () => {
        setActionError('')
        setModalOpen(true)
      },
    })
    return () => setSecondaryHeaderAction(null)
  }, [setSecondaryHeaderAction])

  return (
    <section className="space-y-6 text-slate-800">
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {loading && !resumen ? (
        <div className="flex min-h-[160px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <PiggyBank className="h-4 w-4 text-indigo-500" />
                Total ahorrado
              </div>
              <p className="mt-2 text-3xl font-black text-indigo-600">
                {formatSoles(Number(resumen?.total ?? 0))}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Wallet className="h-4 w-4 text-emerald-500" />
                Libre (sin asignar)
              </div>
              <p className="mt-2 text-3xl font-black text-emerald-600">
                {formatSoles(Number(resumen?.libre ?? 0))}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <PiggyBank className="h-4 w-4 text-violet-500" />
                Asignado a metas
              </div>
              <p className="mt-2 text-3xl font-black text-violet-600">
                {formatSoles(Number(resumen?.asignado ?? 0))}
              </p>
            </article>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-800">
            Disponible para apartar:{' '}
            <span className="font-bold">{formatSoles(disponible)}</span>{' '}
            <span className="text-indigo-500">
              (balance total − ahorros ya apartados)
            </span>
          </div>

          <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <History className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-semibold text-slate-800">Historial de ahorros</h3>
            </div>

            <div className="p-4">
              {actionError && (
                <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {actionError}
                </p>
              )}

              {ahorros.length === 0 ? (
                <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
                  <p className="text-sm text-slate-500">Aún no has apartado ahorros.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {ahorros.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-3 rounded-xl p-2.5 transition hover:bg-slate-50/80"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <PiggyBank className="h-5 w-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-700">
                            {a.descripcion || 'Ahorro'}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400">
                            {formatShortDate(a.fecha)}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <p className="text-sm font-bold tabular-nums text-indigo-600">
                          {formatSoles(Number(a.monto))}
                        </p>
                        <button
                          type="button"
                          disabled={eliminandoId === a.id}
                          onClick={() => void handleEliminar(a)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                          aria-label="Eliminar ahorro"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        </>
      )}

      <AhorroModal
        open={modalOpen}
        disponible={disponible}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          bumpTransactions()
          setModalOpen(false)
        }}
        crearAhorro={crearAhorro}
      />
    </section>
  )
}
