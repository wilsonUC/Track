import { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'

const MESES_NOMBRES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

export interface CustomDatePickerProps {
  value: string // formato 'YYYY-MM-DD' o ''
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  min?: string // 'YYYY-MM-DD'
  max?: string // 'YYYY-MM-DD'
  className?: string
  triggerClassName?: string
  direction?: 'auto' | 'top' | 'bottom'
  id?: string
  ariaLabel?: string
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  clearable = false,
  min,
  max,
  className = '',
  triggerClassName = '',
  direction = 'auto',
  id,
  ariaLabel,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  const containerRef = useRef<HTMLDivElement>(null)

  const hoy = new Date()
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  // Determinar mes y año que se está visualizando
  const getInitialYearMonth = () => {
    if (value && value.length >= 10) {
      const [y, m] = value.split('-')
      return {
        year: parseInt(y, 10) || hoy.getFullYear(),
        month: (parseInt(m, 10) - 1) || hoy.getMonth(),
      }
    }
    return {
      year: hoy.getFullYear(),
      month: hoy.getMonth(),
    }
  }

  const [viewState, setViewState] = useState(getInitialYearMonth)

  // Sincronizar vista si value cambia
  useEffect(() => {
    if (value && value.length >= 10) {
      const [y, m] = value.split('-')
      const year = parseInt(y, 10)
      const month = parseInt(m, 10) - 1
      if (!isNaN(year) && !isNaN(month)) {
        setViewState({ year, month })
      }
    }
  }, [value])

  const calculatePlacement = () => {
    if (direction === 'top') {
      setPlacement('top')
      return
    }
    if (direction === 'bottom') {
      setPlacement('bottom')
      return
    }

    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const menuDesiredHeight = 340

    if (spaceBelow < menuDesiredHeight && spaceAbove > spaceBelow) {
      setPlacement('top')
    } else {
      setPlacement('bottom')
    }
  }

  const handleToggle = () => {
    if (disabled) return
    if (!isOpen) {
      calculatePlacement()
    }
    setIsOpen((prev) => !prev)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      window.addEventListener('resize', calculatePlacement)
      window.addEventListener('scroll', calculatePlacement, true)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', calculatePlacement)
      window.removeEventListener('scroll', calculatePlacement, true)
    }
  }, [isOpen])

  // Formato legible para el input: "15 Oct 2026"
  const getFormattedLabel = () => {
    if (!value || value.length < 10) return ''
    const [yStr, mStr, dStr] = value.split('-')
    const mIndex = parseInt(mStr, 10) - 1
    const dNum = parseInt(dStr, 10)
    if (mIndex >= 0 && mIndex < 12 && !isNaN(dNum)) {
      return `${dNum} de ${MESES_NOMBRES[mIndex]} de ${yStr}`
    }
    return value
  }

  const handlePrevMonth = () => {
    setViewState((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 }
      }
      return { year: prev.year, month: prev.month - 1 }
    })
  }

  const handleNextMonth = () => {
    setViewState((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 }
      }
      return { year: prev.year, month: prev.month + 1 }
    })
  }

  const isDateDisabled = (dateStr: string) => {
    if (min && dateStr < min) return true
    if (max && dateStr > max) return true
    return false
  }

  const handleSelectDay = (day: number) => {
    const formatted = `${viewState.year}-${String(viewState.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (isDateDisabled(formatted)) return
    onChange(formatted)
    setIsOpen(false)
  }

  const handleSelectToday = () => {
    if (isDateDisabled(hoyStr)) return
    setViewState({ year: hoy.getFullYear(), month: hoy.getMonth() })
    onChange(hoyStr)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  // Generar días del mes
  // Primer día de la semana (0: Domingo, 1: Lunes, etc.)
  const firstDayOfMonth = new Date(viewState.year, viewState.month, 1).getDay()
  // Ajustar para que la semana empiece en Lunes (0: Lunes, 6: Domingo)
  const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const daysInMonth = new Date(viewState.year, viewState.month + 1, 0).getDate()

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-label={ariaLabel || placeholder}
        aria-expanded={isOpen}
        className={`group flex h-[42px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-left transition-all duration-200 hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:disabled:bg-slate-900 ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400' : ''
        } ${triggerClassName}`}
      >
        <span className={`block truncate ${!value ? 'text-slate-400 dark:text-slate-500' : 'font-medium text-slate-800 dark:text-slate-100'}`}>
          {value ? getFormattedLabel() : placeholder}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onChange('')
                }
              }}
              title="Borrar fecha"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <Calendar className="h-4 w-4 text-indigo-500 dark:text-indigo-400 transition-transform duration-200 group-hover:scale-110" />
        </div>
      </button>

      {/* Popover flotante del calendario */}
      {isOpen && (
        <div
          className={`absolute left-0 z-50 w-72 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md transition-all animate-in fade-in-0 zoom-in-95 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-950/70 ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {/* Cabecera: Mes y Año */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {MESES_NOMBRES[viewState.month]} {viewState.year}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="py-0.5">
                {dia}
              </div>
            ))}
          </div>

          {/* Grilla de días */}
          <div className="grid grid-cols-7 gap-1 py-1">
            {/* Espacios vacíos antes del primer día */}
            {Array.from({ length: startingDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8 w-8" />
            ))}

            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1
              const dayStr = `${viewState.year}-${String(viewState.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isSelected = value === dayStr
              const isToday = hoyStr === dayStr
              const isDisabled = isDateDisabled(dayStr)

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-150 mx-auto ${
                    isDisabled
                      ? 'cursor-not-allowed opacity-30 text-slate-400'
                      : isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/25 dark:bg-indigo-500 scale-105'
                        : isToday
                          ? 'border border-indigo-500/50 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950/40 font-bold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Footer: Acciones rápidas (Limpiar / Hoy) */}
          <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100 text-xs font-medium dark:border-slate-800">
            {clearable ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors"
              >
                Borrar
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={handleSelectToday}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
