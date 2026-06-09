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
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Reportes Avanzados</h1>
        <p className="mt-1 text-sm text-slate-500">Análisis reactivo de tu base de datos de finanzas.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onFilterChange(option.id)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 ${
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
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95"
        >
          <Download className="h-4 w-4" aria-hidden />
          <span>Exportar Reporte</span>
        </button>
      </div>
    </div>
  )
}
