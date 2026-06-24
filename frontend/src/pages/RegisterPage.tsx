import { AtSign, Lock, Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { AuthField } from '../components/auth/AuthField'
import { AuthSplitCard } from '../components/auth/AuthLayout'
import { formatApiError } from '../utils/apiErrors'

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
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#0f2d6e]">Crear Cuenta</h1>
        <p className="mt-2 text-sm text-[#3b5f9a]">Complete el formulario para registrarse.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <AuthField
              id="register-first-name"
              label="NOMBRE"
              value={firstName}
              onChange={setFirstName}
              icon={User}
              placeholder="Nombre"
              required
              autoComplete="given-name"
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
            />
          </div>

          <AuthField
            id="register-username"
            label="USUARIO"
            value={username}
            onChange={setUsername}
            icon={AtSign}
            placeholder="Nombre de usuario"
            required
            autoComplete="username"
          />

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
          />

          <div className="grid gap-5 sm:grid-cols-2">
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
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#0f2d6e] focus:ring-[#2563eb]/30"
            />
            <span>
              Acepto los{' '}
              <span className="font-semibold text-[#2563eb]">Términos y Condiciones</span> y la{' '}
              <span className="font-semibold text-[#2563eb]">Política de Privacidad</span>.
            </span>
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0f2d6e] py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#0f2d6e]/25 transition hover:bg-[#1a3d7c] disabled:opacity-60"
          >
            {loading ? 'CREANDO CUENTA…' : 'CREAR CUENTA'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tiene una cuenta?{' '}
          <Link to="/login" className="font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
            Inicie sesión
          </Link>
        </p>
      </div>
    </AuthSplitCard>
  )
}
