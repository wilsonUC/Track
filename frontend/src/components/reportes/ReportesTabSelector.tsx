import { BarChart3, CreditCard, Download, FileDown, Loader2, PiggyBank, Repeat, Target } from 'lucide-react'
import type { ReportTab } from './reportesTypes'
import { CustomSelect } from '../ui/CustomSelect'

type ReportesTabSelectorProps = {
  activeTab: ReportTab
  onTabChange: (tab: ReportTab) => void
  onExport: () => void
  onExportPdf?: () => void
  exportingPdf?: boolean
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
  onExportPdf,
  exportingPdf = false,
  exportLabel = 'Exportar CSV',
}: ReportesTabSelectorProps) {
  const selectOptions = tabs.map((tab) => {
    const Icon = tab.icon
    return {
      value: tab.id,
      label: tab.label,
      icon: <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />,
    }
  })

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Selector desplegable en mobile */}
      <div className="w-full sm:hidden">
        <CustomSelect
          value={activeTab}
          onChange={(val) => onTabChange(val as ReportTab)}
          options={selectOptions}
          ariaLabel="Seleccionar sección de reportes"
          triggerClassName="py-2.5 bg-white/90 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs font-semibold text-xs"
        />
      </div>

      {/* Selector de pestañas horizontales en tablet / desktop */}
      <div
        className="hidden sm:flex sm:items-center sm:gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-xs backdrop-blur-sm scrollbar-none dark:border-slate-800/80 dark:bg-slate-900/90"
        role="tablist"
        aria-label="Secciones de reportes"
      >
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
              className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
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

      {/* Botones de exportación (PDF y CSV) */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {onExportPdf && (
          <button
            type="button"
            onClick={onExportPdf}
            disabled={exportingPdf}
            className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-2xl sm:rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-indigo-700 shadow-xs transition-all hover:bg-indigo-100 hover:text-indigo-900 active:scale-[0.98] disabled:opacity-60 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
            title="Exportar captura de la vista en PDF"
          >
            {exportingPdf ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>Generando PDF…</span>
              </>
            ) : (
              <>
                <FileDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden />
                <span>Exportar PDF</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onExport}
          className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-2xl sm:rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.98] dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-indigo-400"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          {exportLabel}
        </button>
      </div>
    </div>
  )
}

