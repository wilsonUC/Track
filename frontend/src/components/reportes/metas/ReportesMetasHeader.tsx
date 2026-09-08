import type { MetaReportFilter, MetasKpis } from '../reportesTypes'

type ReportesMetasHeaderProps = {
  filter: MetaReportFilter
  onFilterChange: (filter: MetaReportFilter) => void
  kpis: MetasKpis
}

export function ReportesMetasHeader({
  filter,
  onFilterChange,
  kpis,
}: ReportesMetasHeaderProps) {
  const options: { id: MetaReportFilter; label: string; count: number }[] = [
    { id: 'todas', label: 'Todas', count: kpis.totalMetas },
    { id: 'en_progreso', label: 'En curso', count: kpis.enProgresoCount },
    { id: 'programadas', label: 'Programadas', count: kpis.programadasCount },
    { id: 'completadas', label: 'Completadas', count: kpis.completadasCount },
  ]

  return (
    <div
      className="inline-flex rounded-full border border-slate-200/80 bg-white p-1 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80"
      role="group"
      aria-label="Filtrar metas por estado"
    >
      {options.map((opt) => {
        const isActive = filter === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onFilterChange(opt.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 sm:px-4 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span>{opt.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {opt.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
