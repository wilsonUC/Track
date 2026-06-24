import { Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login, saveTokens } from '../api/auth'
import { AuthField } from '../components/auth/AuthField'
import { AuthSplitCard } from '../components/auth/AuthLayout'

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
        <h1 className="text-3xl font-bold tracking-tight text-[#0f2d6e]">Bienvenido</h1>
        <p className="mt-2 text-sm text-[#3b5f9a]">Ingrese sus credenciales para acceder al panel.</p>

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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-[#0f2d6e] py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#0f2d6e]/25 transition hover:bg-[#1a3d7c] disabled:opacity-60"
          >
            {loading ? 'ENTRANDO…' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tiene una cuenta?{' '}
          <Link to="/register" className="font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
            Regístrese aquí
          </Link>
        </p>

        <p className="mt-10 text-center text-[10px] font-medium tracking-[0.2em] text-slate-400">
          SOLO PERSONAL AUTORIZADO
        </p>
      </div>
    </AuthSplitCard>
  )
}
