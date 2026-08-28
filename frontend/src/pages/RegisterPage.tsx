import { AtSign, Lock, Mail, Phone, TrendingUp, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { AuthField } from '../components/auth/AuthField'
import { AuthSplitCard } from '../components/auth/AuthLayout'
import { formatApiError } from '../utils/apiErrors'

import brandLogo from '../assets/brand/v4.svg'

export function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones.')
      return
    }

    setLoading(true)
    try {
      await register({
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        telefono,
        password,
      })
      navigate('/login', {
        replace: true,
        state: { message: 'Cuenta creada. Tu acceso quedará habilitado cuando un administrador apruebe la cuenta.' },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(formatApiError(message, 'No se pudo crear la cuenta. Revisa los datos.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSplitCard
      accent="register"
      tagline="Únete a nuestra plataforma y gestiona tus finanzas de manera inteligente y segura."
    >
      <div className="mx-auto w-full max-w-md">
        {/* Mobile Brand Header (replaces Crear Cuenta header on mobile) */}
        <div className="mb-3 flex items-center gap-3 md:hidden">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#1d4ed8] to-[#0f2d6e] p-2 shadow-md shadow-[#0f2d6e]/30">
            {/* Glowing Shimmer Effect */}
            <div className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.5s_infinite]" />
            <img src={brandLogo} alt="FinanzasTrack Logo" className="relative z-10 h-full w-full object-contain drop-shadow-md" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#0f2d6e]">FinanzasTrack</h1>
            <div className="mt-0.5 h-1 w-10 rounded-full bg-[#2dd4bf]" aria-hidden />
          </div>
        </div>

        {/* Desktop Title */}
        <h1 className="hidden text-2xl font-black tracking-tight text-[#0f2d6e] md:block sm:text-3xl">Crear Cuenta</h1>
        <p className="mt-1 text-xs text-[#3b5f9a] sm:text-sm">Complete el formulario para registrarse.</p>

        {/* Mini Mobile Financial Growth Banner */}
        <div className="mt-2.5 mb-3.5 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-emerald-50/90 p-2.5 shadow-sm md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
              <TrendingUp className="h-3.5 w-3.5 stroke-[3]" />
            </div>
            <div>
              <p className="text-[11px] font-black tracking-wide text-[#0f2d6e]">+38.5% Crecimiento</p>
              <p className="text-[10px] text-[#3b5f9a]">Control inteligente de finanzas</p>
            </div>
          </div>

          <div className="w-20 shrink-0">
            <svg viewBox="0 0 280 170" className="w-full overflow-visible">
              <defs>
                <linearGradient id="growthGradMiniReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGradMiniReg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="45%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              <path
                d="M 10,160 C 60,155 110,135 150,95 C 190,55 230,25 268,12 L 268,165 L 10,165 Z"
                fill="url(#growthGradMiniReg)"
                className="animate-[growUp_2.2s_ease-out_forwards]"
              />

              <path
                d="M 10,160 C 60,155 110,135 150,95 C 190,55 230,25 268,12"
                fill="none"
                stroke="url(#lineGradMiniReg)"
                strokeWidth="4.5"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 320,
                  strokeDashoffset: 0,
                  animation: 'drawLine 3.2s ease-in-out forwards',
                }}
              />

              <g className="animate-move-tip">
                <circle
                  cx="0"
                  cy="0"
                  r="6.5"
                  fill="#10b981"
                  className="shadow-lg"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="12"
                  fill="#10b981"
                  fillOpacity="0.35"
                  className="animate-ping"
                />
              </g>
            </svg>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-2.5 sm:mt-4 sm:space-y-3">
          {/* Fila 1: Nombre y Apellidos */}
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            <AuthField
              id="register-first-name"
              label="NOMBRE"
              value={firstName}
              onChange={setFirstName}
              icon={User}
              placeholder="Nombre"
              required
              autoComplete="given-name"
              compact
            />
            <AuthField
              id="register-last-name"
              label="APELLIDOS"
              value={lastName}
              onChange={setLastName}
              icon={User}
              placeholder="Apellidos"
              required
              autoComplete="family-name"
              compact
            />
          </div>

          {/* Fila 2: Usuario y Teléfono en la misma fila */}
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            <AuthField
              id="register-username"
              label="USUARIO"
              value={username}
              onChange={setUsername}
              icon={AtSign}
              placeholder="Nombre de usuario"
              required
              autoComplete="username"
              compact
            />
            <AuthField
              id="register-telefono"
              label="TELÉFONO"
              type="tel"
              value={telefono}
              onChange={setTelefono}
              icon={Phone}
              placeholder="Número de teléfono"
              required
              autoComplete="tel"
              compact
            />
          </div>

          {/* Fila 3: Correo Electrónico */}
          <AuthField
            id="register-email"
            label="CORREO ELECTRÓNICO"
            type="email"
            value={email}
            onChange={setEmail}
            icon={Mail}
            placeholder="correo@ejemplo.com"
            required
            autoComplete="email"
            compact
          />

          {/* Fila 4: Contraseña y Confirmar Contraseña */}
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            <AuthField
              id="register-password"
              label="CONTRASEÑA"
              type="password"
              value={password}
              onChange={setPassword}
              icon={Lock}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              autoComplete="new-password"
              compact
            />
            <AuthField
              id="register-confirm-password"
              label="CONFIRMAR"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              icon={Lock}
              placeholder="Repita la contraseña"
              required
              minLength={8}
              autoComplete="new-password"
              compact
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 pt-0.5 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-[#0f2d6e] focus:ring-[#2563eb]/30"
            />
            <span>
              Acepto los{' '}
              <span className="font-semibold text-[#2563eb]">Términos y Condiciones</span> y la{' '}
              <span className="font-semibold text-[#2563eb]">Política de Privacidad</span>.
            </span>
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-red-700">{error}</p>
          )}

          <div className="pt-0.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0f2d6e] py-2.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#0f2d6e]/25 transition hover:bg-[#1a3d7c] disabled:opacity-60 sm:py-3"
            >
              {loading ? 'CREANDO CUENTA…' : 'CREAR CUENTA'}
            </button>
          </div>
        </form>

        <p className="mt-3 text-center text-xs text-slate-500 sm:mt-3.5 sm:text-sm">
          ¿Ya tiene una cuenta?{' '}
          <Link to="/login" className="font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
            Inicie sesión
          </Link>
        </p>
      </div>
    </AuthSplitCard>
  )
}
