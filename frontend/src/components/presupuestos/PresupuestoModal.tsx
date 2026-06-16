import { X } from 'lucide-react'
import type { FormEvent } from 'react'
import type { ApiCategory } from '../../api/finanzas'

type PresupuestoModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  nombre: string
  limite: string
  montoRapido: string
  categoriaReferenciaId: number | ''
  categoriasGasto: ApiCategory[]
  saving?: boolean
  error?: string
  onNombreChange: (value: string) => void
  onLimiteChange: (value: string) => void
  onMontoRapidoChange: (value: string) => void
  onCategoriaReferenciaChange: (value: number | '') => void
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
  categoriasGasto,
  saving,
  error,
  onNombreChange,
  onLimiteChange,
  onMontoRapidoChange,
  onCategoriaReferenciaChange,
  onClose,
  onSubmit,
}: PresupuestoModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'edit' ? 'Editar presupuesto' : 'Nuevo presupuesto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Nombre</label>
            <input
              type="text"
              placeholder="Ej: Pasajes transporte público"
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Límite mensual (S/)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Ej: 200"
              value={limite}
              onChange={(e) => onLimiteChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Monto del botón (S/)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Ej: 30"
              value={montoRapido}
              onChange={(e) => onMontoRapidoChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Monto que se registra al pulsar «Registrar gasto».
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Categoría de referencia (opcional)
            </label>
            <select
              value={categoriaReferenciaId}
              onChange={(e) =>
                onCategoriaReferenciaChange(e.target.value ? Number(e.target.value) : '')
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Sin categoría (icono genérico)</option>
              {categoriasGasto.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Crear presupuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
