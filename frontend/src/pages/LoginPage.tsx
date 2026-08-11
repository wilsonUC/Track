import { Lock, Mail, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login, saveTokens } from '../api/auth'
import { AuthField } from '../components/auth/AuthField'
import { AuthSplitCard } from '../components/auth/AuthLayout'

import brandLogo from '../assets/brand/v4.svg'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = (location.state as { message?: string } | null)?.message

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(username, password)
      saveTokens(data.access, data.refresh)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSplitCard tagline="Sistema inteligente de gestión financiera personal para el control eficiente de ingresos, gastos y metas de ahorro.">
      <div className="mx-auto w-full max-w-md">
        {/* Mobile Brand Header (replaces Bienvenido on mobile) */}
        <div className="mb-4 flex items-center gap-3.5 md:hidden">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#1d4ed8] to-[#0f2d6e] p-2.5 shadow-md shadow-[#0f2d6e]/30">
            {/* Glowing Shimmer Effect */}
            <div className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.5s_infinite]" />
            <img src={brandLogo} alt="FinanzasTrack Logo" className="relative z-10 h-full w-full object-contain drop-shadow-md" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#0f2d6e]">FinanzasTrack</h1>
            <div className="mt-1 h-1 w-10 rounded-full bg-[#2dd4bf]" aria-hidden />
          </div>
        </div>

        {/* Desktop Title */}
        <h1 className="hidden text-3xl font-black tracking-tight text-[#0f2d6e] md:block">Bienvenido</h1>
        <p className="mt-2 text-sm text-[#3b5f9a] sm:text-base">Ingrese sus credenciales para acceder al panel.</p>

        {/* Mini Mobile Financial Growth Banner */}
        <div className="mt-4 mb-6 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-emerald-50/90 p-3 shadow-sm md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
              <TrendingUp className="h-4 w-4 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-black tracking-wide text-[#0f2d6e]">+38.5% Crecimiento</p>
              <p className="text-[11px] text-[#3b5f9a]">Control inteligente de finanzas</p>
            </div>
          </div>

          <div className="w-24 shrink-0">
            <svg viewBox="0 0 280 170" className="w-full overflow-visible">
              <defs>
                <linearGradient id="growthGradMini" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGradMini" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="45%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              <path
                d="M 10,160 C 60,155 110,135 150,95 C 190,55 230,25 268,12 L 268,165 L 10,165 Z"
                fill="url(#growthGradMini)"
                className="animate-[growUp_2.2s_ease-out_forwards]"
              />

              <path
                d="M 10,160 C 60,155 110,135 150,95 C 190,55 230,25 268,12"
                fill="none"
                stroke="url(#lineGradMini)"
                strokeWidth="5"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 320,
                  strokeDashoffset: 0,
                  animation: 'drawLine 3.2s ease-in-out forwards',
                }}
              />

              <g className="animate-move-tip">
                <circle cx="0" cy="0" r="7" fill="#10b981" className="shadow-md" />
                <circle cx="0" cy="0" r="14" fill="#10b981" fillOpacity="0.35" className="animate-ping" />
              </g>
            </svg>
          </div>
        </div>

        {successMessage && (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <AuthField
            id="login-username"
            label="USUARIO"
            value={username}
            onChange={setUsername}
            icon={Mail}
            placeholder="Ingrese su usuario"
            required
            autoComplete="username"
          />
          <AuthField
            id="login-password"
            label="CONTRASEÑA"
            type="password"
            value={password}
            onChange={setPassword}
            icon={Lock}
            placeholder="Ingrese su contraseña"
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0f2d6e] py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#0f2d6e]/25 transition hover:bg-[#1a3d7c] disabled:opacity-60"
            >
              {loading ? 'ENTRANDO…' : 'INICIAR SESIÓN'}
            </button>
          </div>
        </form>

        <div className="mt-10 space-y-6 text-center">
          <p className="text-sm text-slate-500">
            ¿No tiene una cuenta?{' '}
            <Link to="/register" className="font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
              Regístrese aquí
            </Link>
          </p>

          <p className="text-[10px] font-medium tracking-[0.2em] text-slate-400">
            SOLO PERSONAL AUTORIZADO
          </p>
        </div>
      </div>
    </AuthSplitCard>
  )
}
