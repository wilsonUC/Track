import { useEffect, useRef, useState } from 'react'
import { CalendarRange, Check, ChevronDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { datePresetOptions, type DatePreset } from '../../utils/dateFilters'

export type DateFilterToolbarProps = {
  preset: DatePreset
  onPresetChange: (preset: DatePreset) => void
  customStart: string
  customEnd: string
  onCustomStartChange: (value: string) => void
  onCustomEndChange: (value: string) => void
  onPrevPeriod?: () => void
  onNextPeriod?: () => void
  onResetToCurrent?: () => void
  isCurrentPeriod?: boolean
  periodLabel?: string
}

export function DateFilterToolbar({
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  onPrevPeriod,
  onNextPeriod,
  onResetToCurrent,
  isCurrentPeriod = true,
  periodLabel = '',
}: DateFilterToolbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const showStepper = Boolean(onPrevPeriod && onNextPeriod && preset !== 'custom' && periodLabel)
  const currentPresetLabel = datePresetOptions.find((opt) => opt.id === preset)?.label ?? 'Filtro'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  return (
    <div className="flex flex-col gap-2">
      {/* Barra principal de controles: Desktop muestra pills y stepper; Mobile muestra botón de filtro y stepper */}
      <div className="flex items-center justify-between gap-2 sm:justify-between">
        {/* --- Mobile View (< sm): Botón compacto de filtro con menú desplegable --- */}
        <div className="relative block sm:hidden" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 shadow-xs backdrop-blur-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-expanded={isMobileMenuOpen}
            aria-haspopup="true"
          >
            <Filter className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{currentPresetLabel}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                isMobileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isMobileMenuOpen && (
            <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[170px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Seleccionar período
              </div>
              {datePresetOptions.map((option) => {
                const isSelected = preset === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onPresetChange(option.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* --- Desktop View (sm+): Pills tradicionales --- */}
        <div
          className="hidden sm:flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/80 p-1 shadow-xs backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-slate-950/40"
          role="group"
          aria-label="Filtrar por fecha"
        >
          {datePresetOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onPresetChange(option.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                preset === option.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Navegador < Mes Año > */}
        {showStepper && (
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/80 px-2 py-1 shadow-xs backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-slate-950/40">
            {onResetToCurrent && !isCurrentPeriod && (
              <button
                type="button"
                onClick={onResetToCurrent}
                className="mr-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-600 transition-colors hover:bg-indigo-100 active:scale-95 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
              >
                Hoy
              </button>
            )}

            <button
              type="button"
              onClick={onPrevPeriod}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
              title="Período anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="min-w-[95px] text-center text-xs font-extrabold text-slate-700 dark:text-slate-200 sm:min-w-[110px]">
              {periodLabel}
            </span>

            <button
              type="button"
              onClick={onNextPeriod}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
              title="Período siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Rango personalizado */}
      {preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 shadow-xs backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-slate-950/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <CalendarRange className="h-3.5 w-3.5 text-indigo-500" aria-hidden />
            <span>Desde</span>
          </div>
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            aria-label="Fecha desde"
          />
          <span className="text-xs text-slate-400">hasta</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            aria-label="Fecha hasta"
          />
        </div>
      )}
    </div>
  )
}

