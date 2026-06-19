import type { ApiCategory } from '../../api/finanzas'

type CategoryFilterSelectProps = {
  categories: ApiCategory[]
  value: number | ''
  onChange: (value: number | '') => void
  variant: 'income' | 'expense'
}

export function CategoryFilterSelect({ categories, value, onChange, variant }: CategoryFilterSelectProps) {
  const options = categories.filter((c) => c.tipo === variant)

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <label htmlFor="category-filter" className="text-sm font-medium text-slate-600">
        Categoría
      </label>
      <select
        id="category-filter"
        value={value === '' ? '' : String(value)}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="min-w-[180px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:flex-none"
      >
        <option value="">Todas las categorías</option>
        {options.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}
