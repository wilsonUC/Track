import { BarChart3, CreditCard, Download, PiggyBank, Repeat, Target } from 'lucide-react'
import type { ReportTab } from './reportesTypes'

type ReportesTabSelectorProps = {
  activeTab: ReportTab
  onTabChange: (tab: ReportTab) => void
  onExport: () => void
  exportLabel?: string
}

const tabs: { id: ReportTab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'general', label: 'General', icon: BarChart3 },
  { id: 'ahorros', label: 'Ahorros', icon: PiggyBank },
  { id: 'presupuestos', label: 'Presupuestos', icon: CreditCard },
  { id: 'metas', label: 'Metas', icon: Target },
  { id: 'recurrentes', label: 'Recurrentes', icon: Repeat },
]

export function ReportesTabSelector({
  activeTab,
  onTabChange,
  onExport,
  exportLabel = 'Exportar CSV',
}: ReportesTabSelectorProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Selector de pestañas */}
      <div
        className="inline-flex w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm scrollbar-none dark:border-slate-800/80 dark:bg-slate-900/80 sm:w-auto"
        role="tablist"
        aria-label="Secciones de reportes"
      >
        <div className="flex min-w-full items-center gap-1 sm:min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 sm:px-4 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-600 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Botón de exportación adaptativo */}
      <button
        type="button"
        onClick={onExport}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.98] dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-indigo-400 sm:w-auto"
      >
        <Download className="h-4 w-4" aria-hidden />
        {exportLabel}
      </button>
    </div>
  )
}
