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

const MESES_CORTOS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Oct',
  'Nov',
  'Dic',
]

export interface CustomMonthPickerProps {
  value: string // formato 'YYYY-MM' o ''
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  min?: string // 'YYYY-MM'
  max?: string // 'YYYY-MM'
  className?: string
  triggerClassName?: string
  direction?: 'auto' | 'top' | 'bottom'
  id?: string
  ariaLabel?: string
}

export function CustomMonthPicker({
  value,
  onChange,
  placeholder = 'Seleccionar mes',
  disabled = false,
  clearable = false,
  min,
  max,
  className = '',
  triggerClassName = '',
  direction = 'auto',
  id,
  ariaLabel,
}: CustomMonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  const containerRef = useRef<HTMLDivElement>(null)

  // Año actual de la vista del popup
  const hoy = new Date()
  const anioActual = hoy.getFullYear()
  const mesActual = hoy.getMonth() // 0 - 11

  // Determinar año inicial basado en el valor o el año actual
  const initialYear = value && value.includes('-')
    ? parseInt(value.split('-')[0], 10) || anioActual
    : anioActual

  const [viewYear, setViewYear] = useState<number>(initialYear)

  // Sincronizar viewYear cuando cambie value externamente
  useEffect(() => {
    if (value && value.includes('-')) {
      const y = parseInt(value.split('-')[0], 10)
      if (y) setViewYear(y)
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
    const menuDesiredHeight = 280

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

  // Formato legible para el input
  const getFormattedLabel = () => {
    if (!value || !value.includes('-')) return ''
    const [yStr, mStr] = value.split('-')
    const mIndex = parseInt(mStr, 10) - 1
    if (mIndex >= 0 && mIndex < 12) {
      return `${MESES_NOMBRES[mIndex]} de ${yStr}`
    }
    return value
  }

  const isMonthDisabled = (year: number, monthIndex: number) => {
    const formatted = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
    if (min && formatted < min) return true
    if (max && formatted > max) return true
    return false
  }

  const handleSelectMonth = (monthIndex: number) => {
    if (isMonthDisabled(viewYear, monthIndex)) return
    const formatted = `${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`
    onChange(formatted)
    setIsOpen(false)
  }

  const handleSelectCurrentMonth = () => {
    const formatted = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}`
    if (isMonthDisabled(anioActual, mesActual)) return
    setViewYear(anioActual)
    onChange(formatted)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  const selectedYear = value && value.includes('-') ? parseInt(value.split('-')[0], 10) : null
  const selectedMonth = value && value.includes('-') ? parseInt(value.split('-')[1], 10) - 1 : null

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
              title="Borrar mes seleccionado"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <Calendar className="h-4 w-4 text-indigo-500 dark:text-indigo-400 transition-transform duration-200 group-hover:scale-110" />
        </div>
      </button>

      {/* Popover flotante del selector de meses */}
      {isOpen && (
        <div
          className={`absolute left-0 z-50 w-72 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md transition-all animate-in fade-in-0 zoom-in-95 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-950/70 ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {/* Cabecera: Navegación de año */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewYear((prev) => prev - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Año anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {viewYear}
            </span>

            <button
              type="button"
              onClick={() => setViewYear((prev) => prev + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Año siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Grilla 4x3 de los 12 meses */}
          <div className="grid grid-cols-3 gap-2 py-3">
            {MESES_CORTOS.map((mesCorto, idx) => {
              const isSelected = selectedYear === viewYear && selectedMonth === idx
              const isCurrent = anioActual === viewYear && mesActual === idx
              const isDisabled = isMonthDisabled(viewYear, idx)

              return (
                <button
                  key={mesCorto}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectMonth(idx)}
                  className={`h-10 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center ${
                    isDisabled
                      ? 'cursor-not-allowed opacity-30 text-slate-400'
                      : isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/25 dark:bg-indigo-500 scale-[1.02]'
                        : isCurrent
                          ? 'border border-indigo-500/40 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400/50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 font-bold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                  }`}
                  title={MESES_NOMBRES[idx]}
                >
                  {mesCorto}
                </button>
              )
            })}
          </div>

          {/* Footer: Acciones rápidas (Limpiar / Este mes) */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs font-medium dark:border-slate-800">
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
              onClick={handleSelectCurrentMonth}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors"
            >
              Este mes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
