import { X } from 'lucide-react'
import type { FormEvent } from 'react'
import type { ApiCategory } from '../../api/finanzas'
import { CustomSelect } from '../ui/CustomSelect'

type PresupuestoModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  nombre: string
  limite: string
  montoRapido: string
  categoriaReferenciaId: number | ''
  fechaInicio: string
  fechaFin: string
  categoriasGasto: ApiCategory[]
  saving?: boolean
  error?: string
  onNombreChange: (value: string) => void
  onLimiteChange: (value: string) => void
  onMontoRapidoChange: (value: string) => void
  onCategoriaReferenciaChange: (value: number | '') => void
  onFechaInicioChange: (value: string) => void
  onFechaFinChange: (value: string) => void
  onClose: () => void
  onSubmit: (e: FormEvent) => void
}

export function PresupuestoModal({
  open,
  mode,
  nombre,
  limite,
  montoRapido,
  categoriaReferenciaId,
  fechaInicio,
  fechaFin,
  categoriasGasto,
  saving,
  error,
  onNombreChange,
  onLimiteChange,
  onMontoRapidoChange,
  onCategoriaReferenciaChange,
  onFechaInicioChange,
  onFechaFinChange,
  onClose,
  onSubmit,
}: PresupuestoModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {mode === 'edit' ? 'Editar presupuesto' : 'Nuevo presupuesto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Nombre</label>
            <input
              type="text"
              placeholder="Ej: Pasajes transporte público"
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Límite mensual (S/)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ej: 200"
                value={limite}
                onChange={(e) => onLimiteChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Monto del botón (S/)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ej: 30"
                value={montoRapido}
                onChange={(e) => onMontoRapidoChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Gasto al pulsar «Registrar gasto».
              </p>
            </div>
          </div>

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
              Categoría de referencia
            </label>
            <CustomSelect
              value={categoriaReferenciaId}
              onChange={(val) => onCategoriaReferenciaChange(val ? Number(val) : '')}
              options={[
                { value: '' as number | '', label: 'Sin categoría (icono genérico)' },
                ...categoriasGasto.map((c) => ({ value: c.id as number | '', label: c.nombre })),
              ]}
              placeholder="Sin categoría (icono genérico)"
            />
          </div>

          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

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
              {saving ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Crear presupuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
