import { AlertTriangle, RotateCcw } from 'lucide-react'
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
    <article className="rounded-2xl border border-rose-200 bg-white shadow-sm">
      <div className="border-b border-rose-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Comenzar desde cero</h3>
            <p className="text-sm text-slate-500">
              Borra todos tus datos financieros y empieza limpio.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="rounded-lg border border-rose-100 bg-rose-50/60 px-4 py-3 text-sm text-rose-700">
          <p className="font-semibold">Esta acción eliminará de forma permanente:</p>
          <ul className="mt-2 list-inside list-disc space-y-0.5 text-rose-600">
            <li>Ingresos y gastos (todas las transacciones)</li>
            <li>Presupuestos</li>
            <li>Recurrentes</li>
            <li>Metas de ahorro</li>
            <li>Consejos guardados</li>
          </ul>
          <p className="mt-2 text-rose-600">
            Tu cuenta, contraseña y datos personales <span className="font-semibold">no se tocan</span>.
            No se puede deshacer.
          </p>
        </div>

        {success && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {!confirmando ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setConfirmando(true)
                setSuccess('')
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Comenzar desde cero
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label htmlFor="cuenta-reset-confirm" className="block text-sm font-medium text-slate-700">
              Escribe <span className="font-bold text-rose-600">{PALABRA_CONFIRMACION}</span> para confirmar
            </label>
            <input
              id="cuenta-reset-confirm"
              type="text"
              value={palabra}
              onChange={(e) => setPalabra(e.target.value)}
              placeholder={PALABRA_CONFIRMACION}
              autoComplete="off"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelar}
                disabled={loading}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleReset()}
                disabled={loading || !puedeConfirmar}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                {loading ? 'Borrando…' : 'Borrar todo y empezar de cero'}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
