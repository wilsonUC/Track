import { Download } from 'lucide-react'
import type { ReportFilter } from './reportesTypes'

type ReportesHeaderProps = {
  filter: ReportFilter
  onFilterChange: (filter: ReportFilter) => void
  onExport: () => void
}

const filterOptions: { id: ReportFilter; label: string }[] = [
  { id: 'todos', label: 'Todo' },
  { id: 'ingresos', label: 'Ingresos' },
  { id: 'gastos', label: 'Gastos' },
]

export function ReportesHeader({ filter, onFilterChange, onExport }: ReportesHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        className="flex rounded-full border border-slate-200 bg-white p-1 shadow-sm"
        role="group"
        aria-label="Filtrar reporte"
      >
        {filterOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onFilterChange(option.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 sm:px-5 ${
              filter === option.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onExport}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
      >
        <Download className="h-4 w-4" aria-hidden />
        Exportar CSV
      </button>
    </div>
  )
}
