import { Mail, Phone, Save, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { updateProfile, type UserProfile } from '../../api/auth'
import { formatApiError } from '../../utils/apiErrors'

type CuentaPersonalFormProps = {
  profile: UserProfile
  onSaved: (profile: UserProfile) => void
}

export function CuentaPersonalForm({ profile, onSaved }: CuentaPersonalFormProps) {
  const [firstName, setFirstName] = useState(profile.first_name)
  const [lastName, setLastName] = useState(profile.last_name)
  const [email, setEmail] = useState(profile.email)
  const [telefono, setTelefono] = useState(profile.telefono)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFirstName(profile.first_name)
    setLastName(profile.last_name)
    setEmail(profile.email)
    setTelefono(profile.telefono)
  }, [profile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const updated = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email,
        telefono,
      })
      onSaved(updated)
      setSuccess('Datos actualizados correctamente.')
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(formatApiError(message, 'No se pudieron guardar los cambios.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <User className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Información personal</h3>
            <p className="text-sm text-slate-500">Mantén tus datos de contacto al día.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cuenta-nombre" className="text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="cuenta-nombre"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label htmlFor="cuenta-apellidos" className="text-sm font-medium text-slate-700">
              Apellidos
            </label>
            <input
              id="cuenta-apellidos"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cuenta-email" className="text-sm font-medium text-slate-700">
            Correo electrónico
          </label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="cuenta-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cuenta-telefono" className="text-sm font-medium text-slate-700">
            Teléfono
          </label>
          <div className="relative mt-1">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="cuenta-telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cuenta-username" className="text-sm font-medium text-slate-700">
            Usuario
          </label>
          <input
            id="cuenta-username"
            type="text"
            value={profile.username}
            readOnly
            className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
          <p className="mt-1 text-xs text-slate-400">El nombre de usuario no se puede cambiar.</p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {success && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden />
            {loading ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </article>
  )
}
