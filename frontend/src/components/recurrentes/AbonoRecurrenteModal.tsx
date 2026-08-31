import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { SaldoInsuficienteAhorrosError } from '../../api/finanzas'
import { formatSoles } from '../../utils/financeFormat'
import type { RecurrenteCardView } from './recurrentesTypes'

type AbonoRecurrenteModalProps = {
  open: boolean
  recurrente: RecurrenteCardView | null
  saving?: boolean
  error?: string
  insuficienteData?: SaldoInsuficienteAhorrosError | null
  onClose: () => void
  onClearInsuficiente?: () => void
  onSubmit: (
    monto: string,
    metaLiberarId?: number | null,
    liberarDeAhorroLibre?: boolean,
  ) => void
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500'

export function AbonoRecurrenteModal({
  open,
  recurrente,
  saving,
  error,
  insuficienteData,
  onClose,
  onClearInsuficiente,
  onSubmit,
}: AbonoRecurrenteModalProps) {
  const [monto, setMonto] = useState('')
  const [localError, setLocalError] = useState('')
  const [selectedLiberarOption, setSelectedLiberarOption] = useState<{
    tipo: 'libre' | 'meta'
    id?: number
  } | null>(null)

  useEffect(() => {
    if (open && recurrente) {
      const restante = Math.max(0, recurrente.monto - recurrente.montoPagado)
      setMonto(restante > 0 ? restante.toFixed(2) : '')
      setLocalError('')
      setSelectedLiberarOption(null)
    }
  }, [open, recurrente])

  useEffect(() => {
    if (insuficienteData) {
      if (insuficienteData.libre_ahorros >= insuficienteData.faltante) {
        setSelectedLiberarOption({ tipo: 'libre' })
      } else if (insuficienteData.metas.length > 0) {
        const metaSuficiente = insuficienteData.metas.find(
          (m) => m.monto_disponible >= insuficienteData.faltante,
        )
        if (metaSuficiente) {
          setSelectedLiberarOption({ tipo: 'meta', id: metaSuficiente.id })
        } else {
          setSelectedLiberarOption({ tipo: 'meta', id: insuficienteData.metas[0].id })
        }
      } else {
        setSelectedLiberarOption(null)
      }
    }
  }, [insuficienteData])

  if (!open || !recurrente) return null

  const esIngreso = recurrente.tipo === 'income'
  const restante = Math.max(0, recurrente.monto - recurrente.montoPagado)

  function handleSubmit() {
    setLocalError('')
    const montoNum = Number(monto)
    if (!monto || montoNum <= 0) {
      setLocalError('El monto debe ser mayor que cero.')
      return
    }
    if (montoNum > restante + 0.0001) {
      setLocalError(
        `El monto ingresado no puede superar el saldo restante (${formatSoles(restante)}).`,
      )
      return
    }
    onSubmit(monto)
  }

  function handleConfirmarLiberacionYGuardar() {
    if (!selectedLiberarOption) return
    if (selectedLiberarOption.tipo === 'libre') {
      onSubmit(monto, null, true)
    } else {
      onSubmit(monto, selectedLiberarOption.id, false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-center bg-white pt-3 sm:hidden dark:bg-slate-900">
          <span className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden />
        </div>
        <div className="p-5 pb-6 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {esIngreso ? 'Registrar cobro' : 'Asignar abono'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {esIngreso ? 'Ingreso fijo' : 'Gasto fijo'}:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {recurrente.nombre}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
          </div>

          <div className="mb-3 rounded-xl bg-slate-50 px-3.5 py-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            {esIngreso ? 'Cobrado' : 'Abonado'} este mes:{' '}
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {formatSoles(recurrente.montoPagado)}
            </span>{' '}
            · Falta por registrar:{' '}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {formatSoles(restante)}
            </span>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
              {esIngreso ? 'Monto a registrar' : 'Monto a abonar'}
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

          {(localError || error) && !insuficienteData && (
            <p className="mt-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              {localError || error}
            </p>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-60 dark:shadow-indigo-950/40"
            >
              {saving ? 'Guardando…' : esIngreso ? 'Registrar' : 'Abonar'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Diálogo de Saldo Insuficiente con opción de liberar de Metas o Ahorro Libre */}
      {insuficienteData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Saldo disponible insuficiente
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Disponible actual: {formatSoles(insuficienteData.saldo_actual)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              <p>
                Tu saldo disponible para gastar es de{' '}
                <strong>{formatSoles(insuficienteData.saldo_actual)}</strong>, pero este abono es de{' '}
                <strong>{formatSoles(insuficienteData.monto_gasto)}</strong> (faltan{' '}
                <strong>{formatSoles(insuficienteData.faltante)}</strong>).
              </p>
              {(insuficienteData.metas.length > 0 || insuficienteData.libre_ahorros > 0) && (
                <p className="mt-2 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                  Puedes cubrir los <strong>{formatSoles(insuficienteData.faltante)}</strong>{' '}
                  liberando fondos de tus ahorros o seleccionando una meta:
                </p>
              )}
            </div>

            {/* Opciones de selección de meta o ahorro libre */}
            {insuficienteData.metas.length > 0 || insuficienteData.libre_ahorros > 0 ? (
              <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                {insuficienteData.libre_ahorros >= insuficienteData.faltante && (
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all ${
                      selectedLiberarOption?.tipo === 'libre'
                        ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="liberar_origen_abono"
                        checked={selectedLiberarOption?.tipo === 'libre'}
                        onChange={() => setSelectedLiberarOption({ tipo: 'libre' })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Fondo de Ahorro Libre
                        </span>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                          Disponible: {formatSoles(insuficienteData.libre_ahorros)}
                        </span>
                      </div>
                    </div>
                  </label>
                )}

                {insuficienteData.metas.map((m) => (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all ${
                      selectedLiberarOption?.tipo === 'meta' && selectedLiberarOption.id === m.id
                        ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="liberar_origen_abono"
                        checked={
                          selectedLiberarOption?.tipo === 'meta' && selectedLiberarOption.id === m.id
                        }
                        onChange={() => setSelectedLiberarOption({ tipo: 'meta', id: m.id })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Meta: {m.nombre}
                        </span>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                          Acumulado: {formatSoles(m.monto_disponible)}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                No dispones de fondos en Ahorros ni en Metas para cubrir este gasto.
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (onClearInsuficiente) onClearInsuficiente()
                }}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              {selectedLiberarOption && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleConfirmarLiberacionYGuardar}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-60 dark:shadow-indigo-950/40"
                >
                  {saving ? 'Procesando…' : 'Liberar fondos y abonar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
