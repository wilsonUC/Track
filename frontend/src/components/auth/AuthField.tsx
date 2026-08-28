import type { LucideIcon } from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

type AuthFieldProps = {
  id: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'password'
  value: string
  onChange: (value: string) => void
  icon: LucideIcon
  placeholder?: string
  required?: boolean
  minLength?: number
  autoComplete?: string
  compact?: boolean
}

export function AuthField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  icon: Icon,
  placeholder,
  required,
  minLength,
  autoComplete,
  compact = false,
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div>
      <label
        htmlFor={id}
        className={`block font-bold tracking-wide text-[#1e3a8a] ${compact ? 'text-[10px]' : 'text-[11px]'}`}
      >
        {label}
      </label>
      <div className={`relative ${compact ? 'mt-1' : 'mt-2'}`}>
        <Icon
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${
            compact ? 'left-3 h-4 w-4' : 'left-4 h-[18px] w-[18px]'
          }`}
          aria-hidden
        />
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border border-slate-200 bg-[#f8fafc] text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 ${
            compact ? 'py-2 pl-9 pr-3.5 sm:py-2.5 sm:pl-9.5' : 'py-3.5 pl-11 pr-4'
          } ${isPassword ? (compact ? 'pr-9 sm:pr-10' : 'pr-12') : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={`absolute top-1/2 -translate-y-1/2 rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 ${
              compact ? 'right-2 p-1' : 'right-3 p-1.5'
            }`}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            ) : (
              <Eye className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
