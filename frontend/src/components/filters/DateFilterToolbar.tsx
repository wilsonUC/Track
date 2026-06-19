import { CalendarRange } from 'lucide-react'
import { datePresetOptions, type DatePreset } from '../../utils/dateFilters'

type DateFilterToolbarProps = {
  preset: DatePreset
  onPresetChange: (preset: DatePreset) => void
  customStart: string
  customEnd: string
  onCustomStartChange: (value: string) => void
  onCustomEndChange: (value: string) => void
}

export function DateFilterToolbar({
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}: DateFilterToolbarProps) {
  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"
        role="group"
        aria-label="Filtrar por fecha"
      >
        {datePresetOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onPresetChange(option.id)}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 sm:px-4 ${
              preset === option.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <CalendarRange className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden />
            <span>Desde</span>
          </div>
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            aria-label="Fecha desde"
          />
          <span className="text-sm text-slate-500">hasta</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            aria-label="Fecha hasta"
          />
        </div>
      )}
    </div>
  )
}
