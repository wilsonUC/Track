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
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div>
      <label htmlFor={id} className="text-[11px] font-bold tracking-wide text-[#1e3a8a]">
        {label}
      </label>
      <div className="relative mt-2">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
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
          className={`w-full rounded-xl border border-slate-200 bg-[#f8fafc] py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 ${
            isPassword ? 'pl-11 pr-12' : 'pl-11 pr-4'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}
