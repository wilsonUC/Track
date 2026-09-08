import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export type CustomSelectOption<T extends string | number = string | number> = {
  value: T
  label: string
  icon?: ReactNode
}

export type CustomSelectProps<T extends string | number = string | number> = {
  value: T | ''
  onChange: (value: T) => void
  options: CustomSelectOption<T>[]
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  dropdownClassName?: string
  direction?: 'auto' | 'top' | 'bottom'
  id?: string
  ariaLabel?: string
}

export function CustomSelect<T extends string | number = string | number>({
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción',
  disabled = false,
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  direction = 'auto',
  id,
  ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  const [maxMenuHeight, setMaxMenuHeight] = useState<number>(240)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const calculatePlacement = () => {
    if (direction === 'top') {
      setPlacement('top')
      setMaxMenuHeight(240)
      return
    }
    if (direction === 'bottom') {
      setPlacement('bottom')
      setMaxMenuHeight(240)
      return
    }

    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const menuDesiredHeight = 220

    // Si no hay suficiente espacio abajo (menos de 220px) y arriba hay más espacio
    if (spaceBelow < menuDesiredHeight && spaceAbove > spaceBelow) {
      setPlacement('top')
      setMaxMenuHeight(Math.min(280, Math.max(120, spaceAbove - 20)))
    } else {
      setPlacement('bottom')
      setMaxMenuHeight(Math.min(280, Math.max(120, spaceBelow - 20)))
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

    function handleScrollOrResize() {
      if (isOpen) {
        calculatePlacement()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      window.addEventListener('resize', handleScrollOrResize)
      window.addEventListener('scroll', handleScrollOrResize, true)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize, true)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className={`relative w-full ${isOpen ? 'z-50' : ''} ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-all shadow-xs ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-800 dark:border-indigo-500'
            : 'border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/90 dark:hover:border-slate-600'
        } ${
          disabled
            ? 'cursor-not-allowed opacity-60 bg-slate-50 text-slate-400 dark:bg-slate-800/40 dark:text-slate-500'
            : 'cursor-pointer text-slate-800 dark:text-slate-100'
        } ${triggerClassName}`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${!selectedOption && placeholder ? 'text-slate-400 dark:text-slate-500' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ease-out dark:text-slate-400 ${
            isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
          }`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          style={{ maxHeight: `${maxMenuHeight}px` }}
          className={`absolute left-0 z-50 w-full min-w-[200px] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-2xl backdrop-blur-md transition-all dark:border-slate-700/80 dark:bg-slate-900 ${
            placement === 'top'
              ? 'bottom-full mb-1.5 origin-bottom animate-in fade-in slide-in-from-bottom-2 duration-150'
              : 'top-full mt-1.5 origin-top animate-in fade-in slide-in-from-top-2 duration-150'
          } ${dropdownClassName}`}
        >
          <div className="space-y-1">
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
