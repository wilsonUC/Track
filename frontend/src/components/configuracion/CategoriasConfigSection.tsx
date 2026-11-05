import { AlertCircle, Loader2, Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  deleteCategory,
  fetchCategories,
  type ApiCategory,
} from '../../api/finanzas'
import { getCategoryDisplay } from '../../utils/categoryDisplay'
import { CategoryModal } from './CategoryModal'
import { ConfigSection } from './ConfigSection'

export function CategoriasConfigSection() {
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<ApiCategory | null>(null)
  const [actionError, setActionError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setLoading(true)
    setActionError('')
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch {
      setActionError('No se pudieron cargar las categorías.')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenCreate() {
    setCategoryToEdit(null)
    setActionError('')
    setIsModalOpen(true)
  }

  function handleOpenEdit(cat: ApiCategory) {
    setCategoryToEdit(cat)
    setActionError('')
    setIsModalOpen(true)
  }

  async function handleDelete(cat: ApiCategory) {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${cat.nombre}"?`)) {
      return
    }

    setActionError('')
    setDeletingId(cat.id)
    try {
      await deleteCategory(cat.id)
      setCategories((prev) => prev.filter((c) => c.id !== cat.id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al eliminar la categoría.')
    } finally {
      setDeletingId(null)
    }
  }

  function handleSaved(savedCat: ApiCategory) {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === savedCat.id)
      if (exists) {
        return prev.map((c) => (c.id === savedCat.id ? savedCat : c))
      }
      return [...prev, savedCat]
    })
  }

  const filteredCategories = categories.filter((c) => c.tipo === activeTab)
  const countPersonalizadas = categories.filter((c) => c.es_personalizada).length

  return (
    <>
      <ConfigSection
        icon={Tag}
        iconClass="bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
        title="Categorías"
        subtitle="Administra y personaliza tus categorías de gastos e ingresos."
      >
        <div className="space-y-4 pt-1">
          {actionError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Barra de control: Pestañas + Botón de crear */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('expense')}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                  activeTab === 'expense'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Gastos ({categories.filter((c) => c.tipo === 'expense').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('income')}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                  activeTab === 'income'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Ingresos ({categories.filter((c) => c.tipo === 'income').length})
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95 dark:shadow-indigo-950/40"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva categoría
            </button>
          </div>

          {/* Listado */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
              No hay categorías registradas en esta sección.
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {filteredCategories.map((cat) => {
                const visual = getCategoryDisplay(cat.nombre, cat.icono, cat.color)
                const isDeleting = deletingId === cat.id

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${visual.bg}`}>
                        {visual.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                          {cat.nombre}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {cat.es_personalizada ? (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                              Personalizada
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200/70 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
                              Sistema
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {cat.es_personalizada && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          title="Editar categoría"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          disabled={isDeleting}
                          title="Eliminar categoría"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
            <span>Las categorías del sistema no pueden modificarse para mantener la coherencia de reportes base.</span>
            <span>{countPersonalizadas} personalizada{countPersonalizadas === 1 ? '' : 's'}</span>
          </div>
        </div>
      </ConfigSection>

      <CategoryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        categoryToEdit={categoryToEdit}
        defaultTipo={activeTab}
      />
    </>
  )
}

