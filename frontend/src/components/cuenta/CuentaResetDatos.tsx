import { AlertTriangle, CheckCircle2, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { resetFinancialData } from '../../api/auth'
import { formatApiError } from '../../utils/apiErrors'

type OutletContext = {
  bumpTransactions?: () => void
}

const PALABRA_CONFIRMACION = 'RESETEAR'

export function CuentaResetDatos() {
  const outlet = useOutletContext<OutletContext>()
  const [confirmando, setConfirmando] = useState(false)
  const [palabra, setPalabra] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const puedeConfirmar = palabra.trim().toUpperCase() === PALABRA_CONFIRMACION

  function cancelar() {
    setConfirmando(false)
    setPalabra('')
    setError('')
  }

  async function handleReset() {
    if (!puedeConfirmar) return

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await resetFinancialData()
      setSuccess('Listo. Tus datos financieros se borraron y empiezas desde cero.')
      setConfirmando(false)
      setPalabra('')
      outlet?.bumpTransactions?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(formatApiError(message, 'No se pudieron borrar los datos.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-sm transition-all duration-300 dark:border-rose-900/40 dark:bg-slate-900">
      {/* Cabecera con icono pulsante */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100/80 px-5 py-4 dark:border-rose-950/80 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <span className="absolute -inset-0.5 rounded-xl bg-rose-500/15 animate-ping opacity-60" />
            <AlertTriangle className="relative h-5 w-5 animate-pulse" aria-hidden />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Comenzar desde cero</h3>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                </span>
                Zona de riesgo
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Borra todos tus registros financieros y reinicia tus métricas a cero.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* Lista de lo que se elimina estructurada en tarjetas limpias con animación hover */}
        <div className="rounded-xl border border-rose-200/60 bg-rose-50/40 p-4 dark:border-rose-900/30 dark:bg-rose-950/20">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
            Esta acción eliminará de forma permanente:
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <div className="group flex items-center gap-2.5 rounded-lg border border-transparent bg-white/90 px-3 py-2 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-sm dark:bg-slate-800/90 dark:hover:border-rose-900/50">
              <Trash2 className="h-3.5 w-3.5 text-rose-500 shrink-0 transition-transform duration-200 group-hover:scale-125 group-hover:rotate-12" />
              <span>Transacciones (Ingresos y Gastos)</span>
            </div>
            <div className="group flex items-center gap-2.5 rounded-lg border border-transparent bg-white/90 px-3 py-2 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-sm dark:bg-slate-800/90 dark:hover:border-rose-900/50">
              <Trash2 className="h-3.5 w-3.5 text-rose-500 shrink-0 transition-transform duration-200 group-hover:scale-125 group-hover:rotate-12" />
              <span>Presupuestos configurados</span>
            </div>
            <div className="group flex items-center gap-2.5 rounded-lg border border-transparent bg-white/90 px-3 py-2 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-sm dark:bg-slate-800/90 dark:hover:border-rose-900/50">
              <Trash2 className="h-3.5 w-3.5 text-rose-500 shrink-0 transition-transform duration-200 group-hover:scale-125 group-hover:rotate-12" />
              <span>Pagos y cobros recurrentes</span>
            </div>
            <div className="group flex items-center gap-2.5 rounded-lg border border-transparent bg-white/90 px-3 py-2 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-sm dark:bg-slate-800/90 dark:hover:border-rose-900/50">
              <Trash2 className="h-3.5 w-3.5 text-rose-500 shrink-0 transition-transform duration-200 group-hover:scale-125 group-hover:rotate-12" />
              <span>Metas de ahorro acumuladas</span>
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4 shrink-0 transition-transform duration-200 hover:scale-110" />
            <span>Tu cuenta, contraseña y datos personales <strong>permanecerán intactos</strong>.</span>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in duration-200">
            {error}
          </p>
        )}

        {!confirmando ? (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setConfirmando(true)
                setSuccess('')
              }}
              className="group inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition-all duration-200 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 hover:shadow-md hover:shadow-rose-500/10 active:scale-95 dark:border-rose-800/80 dark:bg-slate-800/80 dark:text-rose-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-300"
            >
              <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180" aria-hidden />
              <span>Comenzar desde cero</span>
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-rose-300/80 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/30 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label htmlFor="cuenta-reset-confirm" className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Para confirmar el reinicio, escribe <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{PALABRA_CONFIRMACION}</span> en el campo:
              </label>
              <input
                id="cuenta-reset-confirm"
                type="text"
                value={palabra}
                onChange={(e) => setPalabra(e.target.value)}
                placeholder={PALABRA_CONFIRMACION}
                autoComplete="off"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono uppercase tracking-wider text-slate-800 shadow-sm transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelar}
                disabled={loading}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleReset()}
                disabled={loading || !puedeConfirmar}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
                <span>{loading ? 'Borrando…' : 'Confirmar y borrar todo'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
