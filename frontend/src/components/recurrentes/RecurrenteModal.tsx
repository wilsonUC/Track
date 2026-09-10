import { useMemo, type FormEvent } from 'react'
import { AlertCircle, AlertTriangle, Trash2, X } from 'lucide-react'
import type { ApiCategory } from '../../api/finanzas'
import { CustomSelect } from '../ui/CustomSelect'

type RecurrenteModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  tipo: 'income' | 'expense'
  nombre: string
  monto: string
  montoBase?: string
  montoPagadoMes?: number
  diaPago: string
  categoriaId: number | ''
  fechaInicio: string
  fechaFin: string
  categorias: ApiCategory[]
  permiteParciales: boolean
  soloEsteMes?: boolean
  esMesPasado?: boolean
  mesLabel?: string
  saving?: boolean
  error?: string
  onTipoChange: (value: 'income' | 'expense') => void
  onNombreChange: (value: string) => void
  onMontoChange: (value: string) => void
  onDiaPagoChange: (value: string) => void
  onCategoriaIdChange: (value: number | '') => void
  onFechaInicioChange: (value: string) => void
  onFechaFinChange: (value: string) => void
  onPermiteParcialesChange: (value: boolean) => void
  onSoloEsteMesChange?: (value: boolean) => void
  onEliminarTransaccionesYGuardar?: () => void
  onHacerManual?: () => void
  onClose: () => void
  onSubmit: (e: FormEvent) => void
}

export function RecurrenteModal({
  open,
  mode,
  tipo,
  nombre,
  monto,
  montoBase,
  montoPagadoMes = 0,
  diaPago,
  categoriaId,
  fechaInicio,
  fechaFin,
  categorias,
  permiteParciales,
  soloEsteMes = true,
  esMesPasado = false,
  mesLabel,
  saving,
  error,
  onTipoChange,
  onNombreChange,
  onMontoChange,
  onDiaPagoChange,
  onCategoriaIdChange,
  onFechaInicioChange,
  onFechaFinChange,
  onPermiteParcialesChange,
  onSoloEsteMesChange,
  onEliminarTransaccionesYGuardar,
  onHacerManual,
  onClose,
  onSubmit,
}: RecurrenteModalProps) {
  if (!open) return null

  const esIngreso = tipo === 'income'
  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo)

  const tipoOptions = [
    { value: 'expense', label: 'Gasto fijo (pago)' },
    { value: 'income', label: 'Ingreso fijo (cobro)' },
  ]

  const categoriaOptions = useMemo(
    () =>
      categoriasFiltradas.map((c) => ({
        value: c.id,
        label: c.nombre,
      })),
    [categoriasFiltradas],
  )

  const numMonto = parseFloat(monto)
  const montoMenorQuePagado =
    mode === 'edit' &&
    montoPagadoMes > 0 &&
    !isNaN(numMonto) &&
    numMonto > 0 &&
    numMonto < montoPagadoMes

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {mode === 'edit'
              ? 'Editar recurrente'
              : esIngreso
                ? 'Nuevo ingreso recurrente'
                : 'Nuevo gasto recurrente'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-5">
          {mode === 'create' && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Tipo</label>
              <CustomSelect
                value={tipo}
                onChange={(val) => onTipoChange(val as 'income' | 'expense')}
                options={tipoOptions}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Nombre</label>
            <input
              type="text"
              placeholder={esIngreso ? 'Ej: Sueldo / Pensión' : 'Ej: Netflix / Internet'}
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                {mode === 'edit' && (soloEsteMes || esMesPasado) ? `Monto en ${mesLabel || 'este mes'} (S/)` : 'Monto mensual (S/)'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={monto}
                onChange={(e) => onMontoChange(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
                  montoMenorQuePagado
                    ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/20 dark:border-amber-600'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700'
                }`}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                {esIngreso ? 'Día de cobro' : 'Día de vencimiento'}
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={diaPago}
                onChange={(e) => onDiaPagoChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Si eliges 31, en febrero se usa el último día del mes.
              </p>
            </div>
          </div>

          {/* Advertencia interactiva si el nuevo monto es menor al ya pagado */}
          {montoMenorQuePagado && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/95 p-3.5 text-xs text-amber-950 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-2">
                  <p className="font-bold leading-snug">
                    El monto ingresado (S/ {numMonto.toFixed(2)}) es menor a lo ya {esIngreso ? 'cobrado' : 'pagado'} este mes (S/ {montoPagadoMes.toFixed(2)}).
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                    Para aplicar este monto menor, primero se deben eliminar las transacciones registradas de este recurrente en {mesLabel || 'este mes'}.
                  </p>
                  <div className="flex flex-col gap-1.5 pt-1 sm:flex-row">
                    <button
                      type="button"
                      onClick={onEliminarTransaccionesYGuardar}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-rose-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar pagos y guardar
                    </button>
                    <button
                      type="button"
                      onClick={onHacerManual}
                      className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100/60 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-200"
                    >
                      Hacerlo manualmente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === 'edit' && !esMesPasado && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs dark:border-indigo-900/40 dark:bg-indigo-950/30">
              <span className="block font-bold text-slate-700 dark:text-slate-200 mb-2">
                ¿A qué meses aplican estos cambios?
              </span>
              <div className="space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="alcanceMonto"
                    checked={soloEsteMes}
                    onChange={() => onSoloEsteMesChange?.(true)}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-semibold text-indigo-950 dark:text-indigo-200">
                      Solo para este mes ({mesLabel || 'este mes'})
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {montoBase
                        ? `Aplica el monto y la opción de abonos parciales solo a este mes. Los demás meses continuarán con su cuota de S/ ${montoBase}.`
                        : 'No alterará los meses pasados ni futuros.'}
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="alcanceMonto"
                    checked={!soloEsteMes}
                    onChange={() => onSoloEsteMesChange?.(false)}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      A partir de este mes en adelante ({mesLabel || 'este mes'} hacia el futuro)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Aplica el monto y la opción de abonos parciales a este mes y todos los meses siguientes.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Comienza en
              </label>
              <input
                type="month"
                value={fechaInicio}
                onChange={(e) => onFechaInicioChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Termina en
              </label>
              <input
                type="month"
                value={fechaFin}
                onChange={(e) => onFechaFinChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Categoría
            </label>
            <CustomSelect
              value={categoriaId}
              onChange={(val) => onCategoriaIdChange(val ? Number(val) : '')}
              options={categoriaOptions}
              placeholder="Selecciona una categoría"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-700 select-none cursor-pointer dark:text-slate-200" htmlFor="permiteParciales">
                Permitir abonos parciales
              </label>
              <p className="text-[10px] text-slate-400">
                Permite registrar pagos en partes durante el mes.
              </p>
            </div>
            <button
              type="button"
              id="permiteParciales"
              role="switch"
              aria-checked={permiteParciales}
              onClick={() => onPermiteParcialesChange(!permiteParciales)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                permiteParciales ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  permiteParciales ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/95 p-3 text-xs font-medium text-rose-800 shadow-xs dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden />
              <div className="space-y-1">
                <span className="block font-bold">Atención</span>
                <p className="leading-relaxed">{error}</p>
              </div>
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
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-60 dark:shadow-none"
            >
              {saving ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Registrar fijo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
