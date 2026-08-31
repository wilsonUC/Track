import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  createTransaction,
  fetchCategories,
  parseSaldoInsuficienteError,
  type ApiCategory,
  type SaldoInsuficienteAhorrosError,
} from '../../api/finanzas'
import type { MovementType } from '../../types/finance'
import { formatSoles } from '../../utils/financeFormat'
import { CustomSelect } from '../ui/CustomSelect'

type NewTransactionModalProps = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  movementType: MovementType
  onMovementTypeChange: (value: MovementType) => void
  amount: string
  onAmountChange: (value: string) => void
  categoryId: number | ''
  onCategoryIdChange: (value: number) => void
  date: string
  onDateChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

export function NewTransactionModal({
  open,
  onClose,
  onSaved,
  movementType,
  onMovementTypeChange,
  amount,
  onAmountChange,
  categoryId,
  onCategoryIdChange,
  date,
  onDateChange,
  description,
  onDescriptionChange,
}: NewTransactionModalProps) {
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Estado para manejar alerta/modal de saldo insuficiente con ahorros
  const [insuficienteData, setInsuficienteData] = useState<SaldoInsuficienteAhorrosError | null>(null)
  const [selectedLiberarOption, setSelectedLiberarOption] = useState<{ tipo: 'meta'; id: number } | { tipo: 'libre' } | null>(null)

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.tipo === movementType),
    [categories, movementType],
  )

  const currentCategory = useMemo(
    () => filteredCategories.find((c) => c.id === categoryId),
    [filteredCategories, categoryId],
  )

  // Cargar categorías globales al abrir el modal
  useEffect(() => {
    if (!open) return

    setError('')
    setInsuficienteData(null)
    setSelectedLiberarOption(null)
    setLoadingCategories(true)
    fetchCategories()
      .then(setCategories)
      .catch(() => setError('No se pudieron cargar las categorías.'))
      .finally(() => setLoadingCategories(false))
  }, [open])

  // Al cambiar gasto/ingreso o al cargar categorías: elegir la primera del tipo
  useEffect(() => {
    if (!open || filteredCategories.length === 0) return

    const stillValid = filteredCategories.some((c) => c.id === categoryId)
    if (!stillValid) {
      onCategoryIdChange(filteredCategories[0].id)
    }
  }, [open, filteredCategories, categoryId, onCategoryIdChange])

  async function ejecutarGuardado(metaLiberarId?: number | null, liberarDeAhorroLibre?: boolean) {
    setError('')

    if (!categoryId) {
      setError('Elige una categoría.')
      return
    }
    if (!amount || Number(amount) <= 0) {
      setError('El monto debe ser mayor que cero.')
      return
    }
    if (!date) {
      setError('Elige una fecha.')
      return
    }

    setSaving(true)
    try {
      await createTransaction({
        categoria: categoryId,
        tipo: movementType,
        monto: amount,
        fecha: date,
        descripcion: description,
        meta_liberar_id: metaLiberarId ?? null,
        liberar_de_ahorro_libre: liberarDeAhorroLibre ?? false,
      })
      setInsuficienteData(null)
      onSaved()
      onClose()
    } catch (err: unknown) {
      const errorWithData = err as {
        data?: unknown
        insuficienteData?: SaldoInsuficienteAhorrosError | null
      }
      const parsedInsuficiente =
        errorWithData?.insuficienteData || parseSaldoInsuficienteError(errorWithData?.data)

      if (parsedInsuficiente) {
        setInsuficienteData(parsedInsuficiente)
        // Autoseleccionar primera opción si existe
        if (parsedInsuficiente.libre_ahorros >= parsedInsuficiente.faltante) {
          setSelectedLiberarOption({ tipo: 'libre' })
        } else if (parsedInsuficiente.metas.length > 0) {
          const metaSuficiente = parsedInsuficiente.metas.find((m) => m.monto_disponible >= parsedInsuficiente.faltante)
          if (metaSuficiente) {
            setSelectedLiberarOption({ tipo: 'meta', id: metaSuficiente.id })
          } else {
            setSelectedLiberarOption({ tipo: 'meta', id: parsedInsuficiente.metas[0].id })
          }
        }
      } else {
        const message = err instanceof Error ? err.message : ''
        setError(message || 'No se pudo guardar la transacción.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    await ejecutarGuardado()
  }

  async function handleConfirmarLiberacionYGuardar() {
    if (!selectedLiberarOption) return
    if (selectedLiberarOption.tipo === 'libre') {
      await ejecutarGuardado(null, true)
    } else {
      await ejecutarGuardado(selectedLiberarOption.id, false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-center bg-white pt-3 sm:hidden dark:bg-slate-900">
          <span className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden />
        </div>
        <div className="p-5 pb-6 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Nueva transacción
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Registra un ingreso o un gasto en tu cuenta.
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

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleSave()
            }}
            className="space-y-4"
          >
            {/* Tipo: Ingreso / Gasto */}
            <div>
              <span className="mb-1 block text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Tipo
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onMovementTypeChange('income')}
                  className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                    movementType === 'income'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  + Ingreso
                </button>
                <button
                  type="button"
                  onClick={() => onMovementTypeChange('expense')}
                  className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                    movementType === 'expense'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  − Gasto
                </button>
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="tx-category" className="mb-1 block text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Categoría
              </label>
              {loadingCategories ? (
                <div className="text-xs text-slate-400">Cargando categorías…</div>
              ) : (
                <CustomSelect
                  id="tx-category"
                  value={categoryId}
                  onChange={(val) => onCategoryIdChange(Number(val))}
                  options={filteredCategories.map((c) => ({
                    value: c.id,
                    label: c.nombre,
                  }))}
                  placeholder="Selecciona una categoría"
                />
              )}
            </div>

            {/* Monto */}
            <div>
              <label htmlFor="tx-amount" className="mb-1 block text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Monto (S/)
              </label>
              <input
                id="tx-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="0.00"
                className={inputClass}
                required
              />
            </div>

            {/* Fecha */}
            <div>
              <label htmlFor="tx-date" className="mb-1 block text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Fecha
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="tx-desc" className="mb-1 block text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Descripción (opcional)
              </label>
              <input
                id="tx-desc"
                type="text"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Detalle o nota"
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !currentCategory}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-60 dark:shadow-indigo-950/40"
              >
                {saving ? 'Guardando…' : 'Guardar transacción'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Interactivo de Liberación de Ahorros / Metas */}
      {insuficienteData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Saldo libre insuficiente
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Disponible actual: {formatSoles(insuficienteData.saldo_actual)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              <p>
                Tu saldo libre para gastar es de <strong>{formatSoles(insuficienteData.saldo_actual)}</strong>, pero este gasto es de <strong>{formatSoles(insuficienteData.monto_gasto)}</strong> (faltan <strong>{formatSoles(insuficienteData.faltante)}</strong>).
              </p>
              {(insuficienteData.metas.length > 0 || insuficienteData.libre_ahorros > 0) && (
                <p className="mt-2 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                  Puedes cubrir los <strong>{formatSoles(insuficienteData.faltante)}</strong> liberando fondos de tus ahorros o seleccionando una meta:
                </p>
              )}
            </div>

            {/* Opciones de selección de meta o ahorro libre */}
            {(insuficienteData.metas.length > 0 || insuficienteData.libre_ahorros > 0) ? (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
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
                        name="liberar_origen"
                        checked={selectedLiberarOption?.tipo === 'libre'}
                        onChange={() => setSelectedLiberarOption({ tipo: 'libre' })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Fondo de Ahorro Libre</span>
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
                        name="liberar_origen"
                        checked={selectedLiberarOption?.tipo === 'meta' && selectedLiberarOption.id === m.id}
                        onChange={() => setSelectedLiberarOption({ tipo: 'meta', id: m.id })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Meta: {m.nombre}</span>
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
                onClick={() => setInsuficienteData(null)}
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
                  {saving ? 'Procesando…' : 'Liberar fondos y registrar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
