import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
} from 'lucide-react'
import {
  fetchProfile,
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  type AccountTier,
  type AdminAccountStatus,
  type AdminUser,
  type AdminUserUpdatePayload,
} from '../api/auth'
import { formatApiError } from '../utils/apiErrors'
import { CustomSelect, type CustomSelectOption } from '../components/ui/CustomSelect'

const TIPO_CUENTA_OPTIONS: CustomSelectOption<AccountTier>[] = [
  { value: 'basico', label: 'Básico' },
  { value: 'avanzado', label: 'Avanzado' },
]

function formatDate(value: string | null) {
  if (!value) return { date: 'Sin ingreso', time: '' }
  const d = new Date(value)
  return {
    date: new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(d),
    time: new Intl.DateTimeFormat('es-PE', { timeStyle: 'short' }).format(d),
  }
}

export function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [currentUsername, setCurrentUsername] = useState('')
  const [drafts, setDrafts] = useState<Record<number, AdminUserUpdatePayload>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'todos' | AdminAccountStatus>('todos')
  const [filterTier, setFilterTier] = useState<'todos' | AccountTier>('todos')

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

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filterStatus !== 'todos' && u.estado_cuenta !== filterStatus) return false
      if (filterTier !== 'todos' && u.tipo_cuenta !== filterTier) return false

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchUsername = u.username.toLowerCase().includes(q)
        const matchName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(q)
        const matchEmail = (u.email || '').toLowerCase().includes(q)
        const matchPhone = (u.telefono || '').toLowerCase().includes(q)
        return matchUsername || matchName || matchEmail || matchPhone
      }

      return true
    })
  }, [users, filterStatus, filterTier, searchTerm])

  async function loadUsers(isManualRefresh = false) {
    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const [profile, adminUsers] = await Promise.all([fetchProfile(), fetchAdminUsers()])
      setCurrentUsername(profile.username)
      setUsers(adminUsers)
    } catch {
      setError('No se pudo cargar el panel. Verifica que tu usuario tenga permisos de administrador.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadUsers()
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

  function hasUserChanges(user: AdminUser, values: AdminUserUpdatePayload) {
    return (
      (values.first_name ?? '') !== (user.first_name ?? '') ||
      (values.last_name ?? '') !== (user.last_name ?? '') ||
      (values.email ?? '') !== (user.email ?? '') ||
      (values.telefono ?? '') !== (user.telefono ?? '') ||
      values.tipo_cuenta !== user.tipo_cuenta
    )
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
      setSuccess(`Usuario @${updated.username} actualizado con éxito.`)
      setTimeout(() => setSuccess(''), 3500)
    } catch (err) {
      const raw = err instanceof Error ? err.message : ''
      setError(formatApiError(raw, 'No se pudo actualizar el usuario.'))
    } finally {
      setSavingId(null)
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar permanentemente a @${user.username}? Esta acción borrará todas sus finanzas.`,
      )
    ) {
      return
    }

    setDeletingId(user.id)
    setError('')
    setSuccess('')
    try {
      await deleteAdminUser(user.id)
      setUsers((current) => current.filter((item) => item.id !== user.id))
      setSuccess(`Usuario @${user.username} eliminado del sistema.`)
      setTimeout(() => setSuccess(''), 3500)
    } catch (err) {
      const raw = err instanceof Error ? err.message : ''
      setError(formatApiError(raw, 'No se pudo eliminar el usuario.'))
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cargando panel de administración…</p>
      </div>
    )
  }

  return (
    <section className="space-y-6 text-slate-900 dark:text-slate-100">

      {/* Alertas */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Tarjetas Superiores de Métricas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total usuarios"
          value={stats.total}
          icon={Users}
          tone="indigo"
          isActive={filterStatus === 'todos'}
          onClick={() => setFilterStatus('todos')}
        />
        <StatCard
          label="Pendientes"
          value={stats.pending}
          icon={Clock}
          tone="amber"
          isActive={filterStatus === 'pending'}
          onClick={() => setFilterStatus(filterStatus === 'pending' ? 'todos' : 'pending')}
        />
        <StatCard
          label="Activos"
          value={stats.active}
          icon={UserCheck}
          tone="emerald"
          isActive={filterStatus === 'active'}
          onClick={() => setFilterStatus(filterStatus === 'active' ? 'todos' : 'active')}
        />
        <StatCard
          label="Bloqueados"
          value={stats.blocked}
          icon={UserX}
          tone="rose"
          isActive={filterStatus === 'blocked'}
          onClick={() => setFilterStatus(filterStatus === 'blocked' ? 'todos' : 'blocked')}
        />
      </div>

      {/* Tarjeta Contenedora Principal */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Encabezado y Barra de Filtros */}
        <div className="border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Usuarios registrados
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aprueba cuentas nuevas, asigna planes Básico / Avanzado o bloquea accesos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Buscador */}
              <div className="relative min-w-[180px] flex-1 sm:w-56 sm:flex-none">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar usuario…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-7 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Filtro Plan */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/70 p-0.5 text-xs dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setFilterTier('todos')}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    filterTier === 'todos'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTier('basico')}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    filterTier === 'basico'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Básico
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTier('avanzado')}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    filterTier === 'avanzado'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Avanzado
                </button>
              </div>

              {(filterStatus !== 'todos' || filterTier !== 'todos' || searchTerm) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus('todos')
                    setFilterTier('todos')
                    setSearchTerm('')
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Limpiar
                </button>
              )}

              <button
                type="button"
                onClick={() => loadUsers(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                title="Refrescar usuarios"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
                <span>{refreshing ? 'Actualizando…' : 'Refrescar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vista Móvil: Tarjetas */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No se encontraron usuarios con los filtros aplicados.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const draft = drafts[user.id] ?? {}
              const values = {
                first_name: draft.first_name ?? user.first_name,
                last_name: draft.last_name ?? user.last_name,
                email: draft.email ?? user.email,
                telefono: draft.telefono ?? user.telefono,
                tipo_cuenta: (draft.tipo_cuenta ?? user.tipo_cuenta ?? 'basico') as AccountTier,
              }
              const isSaving = savingId === user.id
              const isCurrentUser = user.username === currentUsername
              const hasChanges = hasUserChanges(user, values)
              const lastLoginFormatted = formatDate(user.last_login)

              return (
                <div key={user.id} className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">@{user.username}</span>
                      {user.is_staff && (
                        <span className="ml-2 inline-flex items-center gap-0.5 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                          <Shield className="h-2.5 w-2.5" />
                          Admin
                        </span>
                      )}
                    </div>
                    <StatusBadge status={user.estado_cuenta} label={user.estado_cuenta_label} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-slate-400">Nombre</label>
                      <input
                        value={values.first_name}
                        onChange={(e) => updateDraft(user.id, 'first_name', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Nombre"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-slate-400">Apellidos</label>
                      <input
                        value={values.last_name}
                        onChange={(e) => updateDraft(user.id, 'last_name', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Apellidos"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-slate-400">Correo</label>
                      <input
                        value={values.email}
                        onChange={(e) => updateDraft(user.id, 'email', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Correo"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-slate-400">Teléfono</label>
                      <input
                        value={values.telefono}
                        onChange={(e) => updateDraft(user.id, 'telefono', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Teléfono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-slate-400">Tipo de cuenta (Plan)</label>
                    <CustomSelect<AccountTier>
                      value={values.tipo_cuenta}
                      onChange={(val) => updateDraft(user.id, 'tipo_cuenta', val)}
                      options={TIPO_CUENTA_OPTIONS}
                      triggerClassName="!py-1.5 !px-2.5 !text-xs !rounded-lg"
                      dropdownClassName="!min-w-full"
                    />
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Último ingreso: <span className="font-semibold text-slate-600 dark:text-slate-300">{lastLoginFormatted.date} {lastLoginFormatted.time}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={isSaving || deletingId === user.id}
                      onClick={() => saveUser(user, values)}
                      className={`inline-flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold text-white transition disabled:opacity-60 ${
                        hasChanges
                          ? 'bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <Save className="h-3 w-3" />
                      <span>{isSaving ? 'Guardando…' : 'Guardar'}</span>
                    </button>

                    {!isCurrentUser && (
                      <>
                        {user.estado_cuenta === 'pending' && (
                          <button
                            type="button"
                            disabled={isSaving || deletingId === user.id}
                            onClick={() => saveUser(user, { estado_cuenta: 'active', tipo_cuenta: values.tipo_cuenta })}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            Aprobar
                          </button>
                        )}
                        {user.estado_cuenta !== 'blocked' ? (
                          <button
                            type="button"
                            disabled={isSaving || deletingId === user.id}
                            onClick={() => saveUser(user, { estado_cuenta: 'blocked' })}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            Bloquear
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isSaving || deletingId === user.id}
                            onClick={() => saveUser(user, { estado_cuenta: 'active' })}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            Desbloquear
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isSaving || deletingId !== null}
                          onClick={() => handleDeleteUser(user)}
                          className="rounded-lg border border-rose-200 bg-rose-50/60 p-1.5 text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Vista Escritorio: Tabla Sin Scroll Horizontal (100% Ajustada) */}
        <div className="hidden md:block w-full overflow-hidden">
          <table className="w-full table-fixed divide-y divide-slate-100 text-xs dark:divide-slate-800">
            <thead className="bg-slate-50/80 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/40 dark:text-slate-400">
              <tr>
                <th className="w-[21%] px-4 py-3">Usuario</th>
                <th className="w-[22%] px-3 py-3">Contacto</th>
                <th className="w-[16%] px-3 py-3">Nivel / Plan</th>
                <th className="w-[12%] px-3 py-3">Estado</th>
                <th className="w-[14%] px-3 py-3">Último ingreso</th>
                <th className="w-[15%] px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No se encontraron usuarios coincidentes.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const draft = drafts[user.id] ?? {}
                  const values = {
                    first_name: draft.first_name ?? user.first_name,
                    last_name: draft.last_name ?? user.last_name,
                    email: draft.email ?? user.email,
                    telefono: draft.telefono ?? user.telefono,
                    tipo_cuenta: (draft.tipo_cuenta ?? user.tipo_cuenta ?? 'basico') as AccountTier,
                  }
                  const isSaving = savingId === user.id
                  const isCurrentUser = user.username === currentUsername
                  const hasChanges = hasUserChanges(user, values)
                  const lastLoginFormatted = formatDate(user.last_login)

                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                    >
                      {/* Usuario */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-bold text-slate-900 dark:text-slate-100">
                              @{user.username}
                            </span>
                            {user.is_staff && (
                              <span className="shrink-0 rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                Admin
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="shrink-0 rounded bg-slate-100 px-1 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                Tú
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <input
                              value={values.first_name}
                              onChange={(e) => updateDraft(user.id, 'first_name', e.target.value)}
                              className="w-full rounded-md border border-slate-200 bg-slate-50/70 px-2 py-1 text-xs outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-indigo-400"
                              placeholder="Nombre"
                            />
                            <input
                              value={values.last_name}
                              onChange={(e) => updateDraft(user.id, 'last_name', e.target.value)}
                              className="w-full rounded-md border border-slate-200 bg-slate-50/70 px-2 py-1 text-xs outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-indigo-400"
                              placeholder="Apellidos"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="px-3 py-3.5 align-top">
                        <div className="space-y-1">
                          <input
                            value={values.email}
                            onChange={(e) => updateDraft(user.id, 'email', e.target.value)}
                            className="w-full rounded-md border border-slate-200 bg-slate-50/70 px-2 py-1 text-xs outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-indigo-400"
                            placeholder="correo@ejemplo.com"
                          />
                          <input
                            value={values.telefono}
                            onChange={(e) => updateDraft(user.id, 'telefono', e.target.value)}
                            className="w-full rounded-md border border-slate-200 bg-slate-50/70 px-2 py-1 text-xs outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-indigo-400"
                            placeholder="Teléfono"
                          />
                        </div>
                      </td>

                      {/* Nivel / Plan */}
                      <td className="px-3 py-3.5 align-top">
                        <div className="space-y-1">
                          <CustomSelect<AccountTier>
                            value={values.tipo_cuenta}
                            onChange={(val) => updateDraft(user.id, 'tipo_cuenta', val)}
                            options={TIPO_CUENTA_OPTIONS}
                            triggerClassName="!py-1.5 !px-2.5 !text-xs !rounded-lg"
                            dropdownClassName="!min-w-full"
                          />
                          {hasChanges && values.tipo_cuenta !== user.tipo_cuenta && (
                            <span className="block text-[10px] font-semibold text-amber-500">
                              Cambio pendiente
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-3 py-3.5 align-top">
                        <div className="pt-1">
                          <StatusBadge status={user.estado_cuenta} label={user.estado_cuenta_label} />
                        </div>
                      </td>

                      {/* Último ingreso (Sin partirse) */}
                      <td className="px-3 py-3.5 align-top whitespace-nowrap">
                        <div className="pt-1 text-slate-600 dark:text-slate-300">
                          <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {lastLoginFormatted.date}
                          </p>
                          {lastLoginFormatted.time && (
                            <p className="text-[10px] text-slate-400">{lastLoginFormatted.time}</p>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3.5 text-right align-top">
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            type="button"
                            disabled={isSaving || deletingId === user.id}
                            onClick={() => saveUser(user, values)}
                            className={`w-full max-w-[110px] rounded-lg py-1.5 text-xs font-bold text-white transition shadow-xs ${
                              hasChanges
                                ? 'bg-indigo-600 hover:bg-indigo-500 ring-2 ring-indigo-500/20'
                                : 'bg-slate-700 hover:bg-slate-600'
                            } disabled:opacity-60`}
                          >
                            {isSaving ? 'Guardando…' : 'Guardar'}
                          </button>

                          {!isCurrentUser ? (
                            <div className="flex w-full max-w-[110px] items-center gap-1">
                              {user.estado_cuenta === 'pending' && (
                                <button
                                  type="button"
                                  disabled={isSaving || deletingId === user.id}
                                  onClick={() => saveUser(user, { estado_cuenta: 'active', tipo_cuenta: values.tipo_cuenta })}
                                  className="flex-1 rounded-md border border-emerald-300 bg-emerald-50 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                >
                                  Aprobar
                                </button>
                              )}
                              {user.estado_cuenta !== 'blocked' ? (
                                <button
                                  type="button"
                                  disabled={isSaving || deletingId === user.id}
                                  onClick={() => saveUser(user, { estado_cuenta: 'blocked' })}
                                  className="flex-1 rounded-md border border-slate-200 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                  Bloquear
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isSaving || deletingId === user.id}
                                  onClick={() => saveUser(user, { estado_cuenta: 'active' })}
                                  className="flex-1 rounded-md border border-emerald-300 bg-emerald-50 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                >
                                  Activar
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={isSaving || deletingId !== null}
                                onClick={() => handleDeleteUser(user)}
                                className="rounded-md border border-rose-200 p-1 text-rose-500 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                title="Eliminar"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Cuenta actual</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function StatusBadge({ status, label }: { status: AdminAccountStatus; label: string }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
        <span>{label}</span>
      </span>
    )
  }
  if (status === 'blocked') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
        <span>{label}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 animate-pulse" />
      <span>{label}</span>
    </span>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  isActive,
  onClick,
}: {
  label: string
  value: number
  icon: typeof Users
  tone: 'indigo' | 'amber' | 'emerald' | 'rose'
  isActive?: boolean
  onClick?: () => void
}) {
  const styles = {
    indigo: {
      border: 'hover:border-indigo-500/50',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20',
      iconBox: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    },
    amber: {
      border: 'hover:border-amber-500/50',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20',
      iconBox: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20',
      iconBox: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    },
    rose: {
      border: 'hover:border-rose-500/50',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20',
      iconBox: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    },
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 dark:bg-slate-900/80 ${
        isActive ? styles.activeBorder : 'border-slate-200 bg-white dark:border-slate-800'
      } ${styles.border}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${styles.iconBox}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">{value}</p>
    </button>
  )
}
