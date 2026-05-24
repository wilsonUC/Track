import { useState } from 'react'
import { register } from '../api/auth'

type RegisterPageProps = {
  onGoLogin: () => void
  onRegistered: () => void
}

function formatRegisterError(raw: string): string {
  try {
    const data = JSON.parse(raw) as Record<string, string[] | string>
    const parts: string[] = []
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        parts.push(`${key}: ${value.join(' ')}`)
      } else if (typeof value === 'string') {
        parts.push(value)
      }
    }
    if (parts.length > 0) return parts.join(' · ')
  } catch {
    /* texto plano */
  }
  return 'No se pudo crear la cuenta. Revisa los datos.'
}

export function RegisterPage({ onGoLogin, onRegistered }: RegisterPageProps) {
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
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
      onRegistered()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(formatRegisterError(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-xl font-bold text-slate-900">Registro de usuario</h1>
        <p className="mt-1 text-sm text-slate-500">
          Completa el formulario para crear tu cuenta
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Nombre</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
            <p className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Creando cuenta…' : 'Crear usuario'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={onGoLogin}
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  )
}
