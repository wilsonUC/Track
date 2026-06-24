import { useEffect, useMemo, useState } from 'react'
import {
  fetchProfile,
  fetchAdminUsers,
  updateAdminUser,
  type AdminAccountStatus,
  type AdminUser,
  type AdminUserUpdatePayload,
} from '../api/auth'
import { formatApiError } from '../utils/apiErrors'

function statusClass(status: AdminAccountStatus) {
  if (status === 'active') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (status === 'blocked') return 'border-red-200 bg-red-50 text-red-700'
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function formatDate(value: string | null) {
  if (!value) return 'Sin ingreso'
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [currentUsername, setCurrentUsername] = useState('')
  const [drafts, setDrafts] = useState<Record<number, AdminUserUpdatePayload>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const stats = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.total += 1
        acc[user.estado_cuenta] += 1
        return acc
      },
      { total: 0, pending: 0, active: 0, blocked: 0 },
    )
  }, [users])

  async function loadUsers() {
    setLoading(true)
    setError('')
    try {
      const [profile, adminUsers] = await Promise.all([fetchProfile(), fetchAdminUsers()])
      setCurrentUsername(profile.username)
      setUsers(adminUsers)
    } catch {
      setError('No se pudo cargar el panel. Verifica que tu usuario tenga permisos de administrador.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  function updateDraft(id: number, field: keyof AdminUserUpdatePayload, value: string) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }))
  }

  async function saveUser(user: AdminUser, payload: AdminUserUpdatePayload) {
    setSavingId(user.id)
    setError('')
    setSuccess('')
    try {
      const updated = await updateAdminUser(user.id, payload)
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setDrafts((current) => {
        const next = { ...current }
        delete next[user.id]
        return next
      })
      setSuccess(`Usuario ${updated.username} actualizado correctamente.`)
    } catch (err) {
      const raw = err instanceof Error ? err.message : ''
      setError(formatApiError(raw, 'No se pudo actualizar el usuario.'))
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-slate-500">Cargando usuarios…</p>
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuarios" value={stats.total} />
        <StatCard label="Pendientes" value={stats.pending} tone="amber" />
        <StatCard label="Activos" value={stats.active} tone="emerald" />
        <StatCard label="Bloqueados" value={stats.blocked} tone="red" />
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-900">Usuarios registrados</h3>
          <p className="mt-1 text-sm text-slate-500">
            Aprueba cuentas nuevas o bloquea accesos cuando sea necesario.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Usuario</th>
                <th className="px-5 py-3">Contacto</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Último ingreso</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const draft = drafts[user.id] ?? {}
                const values = {
                  first_name: draft.first_name ?? user.first_name,
                  last_name: draft.last_name ?? user.last_name,
                  email: draft.email ?? user.email,
                  telefono: draft.telefono ?? user.telefono,
                }
                const isSaving = savingId === user.id
                const isCurrentUser = user.username === currentUsername

                return (
                  <tr key={user.id} className="align-top">
                    <td className="space-y-2 px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">@{user.username}</p>
                        {user.is_staff && <p className="text-xs font-medium text-indigo-600">Administrador</p>}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          value={values.first_name}
                          onChange={(e) => updateDraft(user.id, 'first_name', e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                          placeholder="Nombre"
                        />
                        <input
                          value={values.last_name}
                          onChange={(e) => updateDraft(user.id, 'last_name', e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                          placeholder="Apellidos"
                        />
                      </div>
                    </td>
                    <td className="space-y-2 px-5 py-4">
                      <input
                        value={values.email}
                        onChange={(e) => updateDraft(user.id, 'email', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                        placeholder="Correo"
                      />
                      <input
                        value={values.telefono}
                        onChange={(e) => updateDraft(user.id, 'telefono', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                        placeholder="Teléfono"
                      />
                    </td>
                    <td className="space-y-2 px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(user.estado_cuenta)}`}>
                        {user.estado_cuenta_label}
                      </span>
                      <p className="text-xs text-slate-500">Usa los botones de acciones para cambiarlo.</p>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(user.last_login)}</td>
                    <td className="space-y-2 px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => saveUser(user, values)}
                        className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {isSaving ? 'Guardando…' : 'Guardar'}
                      </button>
                      {isCurrentUser ? (
                        <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
                          Tu propia cuenta no se cambia aquí.
                        </p>
                      ) : (
                        <>
                      {user.estado_cuenta !== 'active' && (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => saveUser(user, { estado_cuenta: 'active' })}
                          className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                        >
                          Aprobar
                        </button>
                      )}
                      {user.estado_cuenta !== 'blocked' && (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => saveUser(user, { estado_cuenta: 'blocked' })}
                          className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          Bloquear
                        </button>
                      )}
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value, tone = 'slate' }: { label: string; value: number; tone?: 'slate' | 'amber' | 'emerald' | 'red' }) {
  const toneClass = {
    slate: 'border-slate-200 bg-white text-slate-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    red: 'border-red-200 bg-red-50 text-red-800',
  }[tone]

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </article>
  )
}
