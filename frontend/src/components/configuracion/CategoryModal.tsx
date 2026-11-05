import { Check, Loader2, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createCategory, updateCategory, type ApiCategory } from '../../api/finanzas'
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  getCategoryDisplay,
} from '../../utils/categoryDisplay'

type CategoryModalProps = {
  open: boolean
  onClose: () => void
  onSaved: (category: ApiCategory) => void
  categoryToEdit?: ApiCategory | null
  defaultTipo?: 'income' | 'expense'
}

export function CategoryModal({
  open,
  onClose,
  onSaved,
  categoryToEdit,
  defaultTipo = 'expense',
}: CategoryModalProps) {
  const isEditing = Boolean(categoryToEdit)

  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<'income' | 'expense'>(defaultTipo)
  const [color, setColor] = useState('indigo')
  const [icono, setIcono] = useState('tag')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return

    setError('')
    if (categoryToEdit) {
      setNombre(categoryToEdit.nombre)
      setTipo(categoryToEdit.tipo)
      setColor(categoryToEdit.color || 'indigo')
      setIcono(categoryToEdit.icono || 'tag')
    } else {
      setNombre('')
      setTipo(defaultTipo)
      setColor(defaultTipo === 'income' ? 'emerald' : 'rose')
      setIcono(defaultTipo === 'income' ? 'briefcase' : 'shopping-bag')
    }
  }, [open, categoryToEdit, defaultTipo])

  if (!open) return null

  const previewDisplay = getCategoryDisplay(nombre.trim() || 'Mi categoría', icono, color)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const cleanNombre = nombre.trim()
    if (!cleanNombre) {
      setError('Escribe un nombre para la categoría.')
      return
    }

    setSaving(true)
    try {
      if (isEditing && categoryToEdit) {
        const updated = await updateCategory(categoryToEdit.id, {
          nombre: cleanNombre,
          color,
          icono,
        })
        onSaved(updated)
      } else {
        const created = await createCategory({
          nombre: cleanNombre,
          tipo,
          color,
          icono,
        })
        onSaved(created)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la categoría.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 id="category-modal-title" className="text-base font-bold text-slate-800 dark:text-slate-100">
                {isEditing ? 'Editar categoría' : 'Nueva categoría'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personaliza el nombre, icono y color
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Vista previa viva */}
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Vista previa
            </p>
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all shadow-sm ${previewDisplay.bg}`}>
                {previewDisplay.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {nombre.trim() || 'Nombre de la categoría'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${previewDisplay.badge}`}>
                    {tipo === 'income' ? 'Ingreso' : 'Gasto'}
                  </span>
                  <span className="text-[11px] text-slate-400">Personalizada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tipo de categoría (solo al crear) */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tipo de movimiento
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTipo('expense')
                    if (color === 'emerald') setColor('rose')
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                    tipo === 'expense'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-500/50 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipo('income')
                    if (color === 'rose') setColor('emerald')
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                    tipo === 'income'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Ingreso
                </button>
              </div>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label htmlFor="cat-nombre" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre de la categoría
            </label>
            <input
              id="cat-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Gimnasio, Mascotas, Cursos…"
              maxLength={100}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>

          {/* Paleta de Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Color identificador
            </label>
            <div className="flex flex-wrap gap-2.5">
              {Object.values(CATEGORY_COLORS).map((col) => {
                const isSelected = color === col.key
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => setColor(col.key)}
                    title={col.name}
                    className={`relative h-7 w-7 rounded-full transition-transform active:scale-95 flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white drop-shadow-sm" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selector de Icono */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Icono representativo
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 max-h-48 overflow-y-auto p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              {Object.entries(CATEGORY_ICONS).map(([key, item]) => {
                const IconComponent = item.icon
                const isSelected = icono === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIcono(key)}
                    title={item.label}
                    className={`flex flex-col items-center justify-center h-10 w-10 rounded-xl transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300 dark:shadow-indigo-950/40 scale-105'
                        : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !nombre.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:shadow-indigo-950/40"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Guardando…
              </>
            ) : isEditing ? (
              'Guardar cambios'
            ) : (
              'Crear categoría'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

