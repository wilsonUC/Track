import type { FormEvent } from 'react'
import { X } from 'lucide-react'
import type { ApiCategory } from '../../api/finanzas'

type RecurrenteModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  tipo: 'income' | 'expense'
  nombre: string
  monto: string
  diaPago: string
  categoriaId: number | ''
  categorias: ApiCategory[]
  saving?: boolean
  error?: string
  onTipoChange: (value: 'income' | 'expense') => void
  onNombreChange: (value: string) => void
  onMontoChange: (value: string) => void
  onDiaPagoChange: (value: string) => void
  onCategoriaIdChange: (value: number | '') => void
  onClose: () => void
  onSubmit: (e: FormEvent) => void
}

export function RecurrenteModal({
  open,
  mode,
  tipo,
  nombre,
  monto,
  diaPago,
  categoriaId,
  categorias,
  saving,
  error,
  onTipoChange,
  onNombreChange,
  onMontoChange,
  onDiaPagoChange,
  onCategoriaIdChange,
  onClose,
  onSubmit,
}: RecurrenteModalProps) {
  if (!open) return null

  const esIngreso = tipo === 'income'
  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'edit'
              ? 'Editar recurrente'
              : esIngreso
                ? 'Nuevo ingreso recurrente'
                : 'Nuevo gasto recurrente'}
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
          {mode === 'create' && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => onTipoChange(e.target.value as 'income' | 'expense')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="expense">Gasto fijo (pago)</option>
                <option value="income">Ingreso fijo (cobro)</option>
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Nombre</label>
            <input
              type="text"
              placeholder={esIngreso ? 'Ej: Sueldo / Pensión' : 'Ej: Netflix / Internet'}
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                Monto fijo (S/)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={monto}
                onChange={(e) => onMontoChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                {esIngreso ? 'Día de cobro' : 'Día de vencimiento'}
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={diaPago}
                onChange={(e) => onDiaPagoChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Si eliges 31, en febrero se usa el último día del mes.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Categoría
            </label>
            <select
              value={categoriaId}
              onChange={(e) => onCategoriaIdChange(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categoriasFiltradas.map((c) => (
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
              {saving ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Registrar fijo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
