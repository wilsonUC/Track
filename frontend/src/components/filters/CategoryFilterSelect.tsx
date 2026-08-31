import { useMemo } from 'react'
import type { ApiCategory } from '../../api/finanzas'
import { CustomSelect } from '../ui/CustomSelect'

type CategoryFilterSelectProps = {
  categories: ApiCategory[]
  value: number | ''
  onChange: (value: number | '') => void
  variant: 'income' | 'expense'
}

export function CategoryFilterSelect({ categories, value, onChange, variant }: CategoryFilterSelectProps) {
  const options = useMemo(() => {
    const list = categories.filter((c) => c.tipo === variant)
    return [
      { value: '' as number | '', label: 'Todas las categorías' },
      ...list.map((c) => ({ value: c.id as number | '', label: c.nombre })),
    ]
  }, [categories, variant])

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <label htmlFor="category-filter" className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        Categoría
      </label>
      <div className="min-w-[200px] flex-1 sm:flex-none">
        <CustomSelect
          id="category-filter"
          value={value}
          onChange={(val) => onChange(val)}
          options={options}
          placeholder="Todas las categorías"
        />
      </div>
    </div>
  )
}
