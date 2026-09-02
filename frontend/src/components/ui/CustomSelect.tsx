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
  id,
  ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
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
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
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
        <span className={`truncate ${!selectedOption && placeholder ? 'text-slate-400 dark:text-slate-500' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
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
          className={`absolute left-0 top-full z-50 mt-1.5 max-h-64 w-full min-w-[200px] origin-top overflow-y-auto rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md transition-all dark:border-slate-700/80 dark:bg-slate-900/95 ${dropdownClassName}`}
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
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
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
