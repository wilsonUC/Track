import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchProfile, type UserProfile } from '../api/auth'
import { CuentaPasswordForm } from '../components/cuenta/CuentaPasswordForm'
import { CuentaPersonalForm } from '../components/cuenta/CuentaPersonalForm'
import { CuentaProfileCard } from '../components/cuenta/CuentaProfileCard'
import { CuentaResetDatos } from '../components/cuenta/CuentaResetDatos'

type OutletContext = {
  refreshProfile: () => Promise<void>
  onLogout?: () => void
}

export function CuentaPage() {
  const { refreshProfile, onLogout } = useOutletContext<OutletContext>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchProfile()
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar tu perfil.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleProfileSaved(updated: UserProfile) {
    setProfile(updated)
    await refreshProfile()
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-slate-500">Cargando perfil…</p>
  }

  if (error || !profile) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        {error || 'Perfil no disponible.'}
      </section>
    )
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]">
      <div className="lg:sticky lg:top-[48px] lg:self-start">
        <CuentaProfileCard profile={profile} onLogout={onLogout} />
      </div>

      <div className="space-y-6">
        <CuentaPersonalForm profile={profile} onSaved={handleProfileSaved} />
        <CuentaPasswordForm />
        <CuentaResetDatos />
      </div>
    </section>
  )
}
