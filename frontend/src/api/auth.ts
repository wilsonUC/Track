import { clearIaChatStorage } from '../utils/iaChatStorage'

const API = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export type LoginResponse = {
    access: string
    refresh: string
}

export type AccountTier = 'basico' | 'avanzado'

export type UserProfile = {
  username: string
  first_name: string
  last_name: string
  email: string
  telefono: string
  foto?: string | null
  foto_original?: string | null
  estado_cuenta: 'pending' | 'active' | 'blocked'
  tipo_cuenta?: AccountTier
  tipo_cuenta_label?: string
  fecha_expiracion?: string | null
  is_expired?: boolean
  dias_restantes?: number | null
  is_staff: boolean
}

export function profileDisplayName(profile: UserProfile) {
  const first = profile.first_name.trim()
  if (first) return first
  return profile.username
}

export function profileFullName(profile: UserProfile) {
  const parts = [profile.first_name.trim(), profile.last_name.trim()].filter(Boolean)
  if (parts.length > 0) return parts.join(' ')
  return profile.username
}

export function profileInitial(profile: UserProfile) {
  const name = profileDisplayName(profile)
  return name.charAt(0).toUpperCase()
}

function buildAuthHeaders(token: string, initHeaders?: HeadersInit, body?: BodyInit | null) {
  const headers = new Headers(initHeaders)
  headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  return headers
}

let refreshTokenPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (!refreshTokenPromise) {
    refreshTokenPromise = requestNewAccessToken().finally(() => {
      refreshTokenPromise = null
    })
  }
  return refreshTokenPromise
}

async function requestNewAccessToken(): Promise<string> {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('No hay sesión')

  const res = await fetch(`${API}/api/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  if (!res.ok) {
    logout()
    throw new Error('Sesión expirada')
  }

  const data = (await res.json()) as { access?: string }
  if (!data.access) {
    logout()
    throw new Error('Sesión expirada')
  }

  localStorage.setItem('access', data.access)
  return data.access
}

function redirectToLogin(reason?: string) {
  if (window.location.pathname !== '/login') {
    window.location.href = reason === 'expired' ? '/login?expired=1' : '/login'
  }
}

export async function authFetch(path: string, init: RequestInit = {}) {
  const token = getAccessToken()
  if (!token) {
    logout()
    redirectToLogin()
    throw new Error('No hay sesión')
  }

  const url = path.startsWith('http') ? path : `${API}${path}`
  const request = (accessToken: string) =>
    fetch(url, {
      ...init,
      headers: buildAuthHeaders(accessToken, init.headers, init.body),
    })

  let res = await request(token)
  if (res.status === 401) {
    try {
      const newAccess = await refreshAccessToken()
      res = await request(newAccess)
    } catch {
      logout()
      redirectToLogin('expired')
      throw new Error('Sesión expirada')
    }
  }

  if (res.status === 401) {
    logout()
    redirectToLogin('expired')
    throw new Error('Sesión expirada')
  }

  return res
}

export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (API && !API.includes('127.0.0.1') && !API.includes('localhost')) {
      if (url.includes('127.0.0.1') || url.includes('localhost')) {
        const path = url.replace(/^https?:\/\/[^/]+/, '')
        return `${API}${path}`
      }
    }
    return url
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`
  return `${API}${cleanPath}`
}

export function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    foto: resolveMediaUrl(profile.foto),
    foto_original: resolveMediaUrl(profile.foto_original),
  }
}

export async function fetchProfile(): Promise<UserProfile> {
  const res = await authFetch('/api/perfil/')
  if (!res.ok) throw new Error('No se pudo cargar el perfil')
  const data = await res.json()
  return normalizeProfile(data)
}

export type ProfileUpdatePayload = {
  first_name?: string
  last_name?: string
  email?: string
  telefono?: string
}

export async function updateProfile(data: ProfileUpdatePayload): Promise<UserProfile> {
  const res = await authFetch('/api/perfil/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  const updated = await res.json()
  return normalizeProfile(updated)
}

export async function uploadProfilePhoto(file: File, originalFile?: File): Promise<UserProfile> {
  const formData = new FormData()
  formData.append('foto', file)
  if (originalFile) {
    formData.append('foto_original', originalFile)
  }
  const res = await authFetch('/api/perfil/', {
    method: 'PATCH',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.foto?.[0] || err.detail || 'Error al subir la imagen')
  }
  const data = await res.json()
  return normalizeProfile(data)
}

export async function removeProfilePhoto(): Promise<UserProfile> {
  const formData = new FormData()
  formData.append('eliminar_foto', 'true')
  const res = await authFetch('/api/perfil/', {
    method: 'PATCH',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Error al eliminar la foto')
  }
  const data = await res.json()
  return normalizeProfile(data)
}

export type ChangePasswordPayload = {
  current_password: string
  new_password: string
  confirm_password: string
}

export async function changePassword(data: ChangePasswordPayload): Promise<void> {
  const res = await authFetch('/api/perfil/cambiar-password/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
}

export async function resetFinancialData(): Promise<void> {
  const res = await authFetch('/api/perfil/resetear-datos/', {
    method: 'POST',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
}

export type RegisterPayload = {
  username: string
  first_name: string
  last_name: string
  email: string
  telefono: string
  password: string
}

export async function login(username: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      if (typeof err.detail === 'string') throw new Error(err.detail)
      throw new Error('Usuario o contraseña incorrectos')
    }
    return res.json()
  }

  export async function register(data: RegisterPayload) {
    const res = await fetch(`${API}/api/registro/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(JSON.stringify(err))
    }
    return res.json()
  }

  export function saveTokens(access: string, refresh: string) {
    localStorage.setItem('access', access)
    localStorage.setItem('refresh', refresh)
  }

  export function getAccessToken(): string | null {
    return localStorage.getItem('access')
  }

  export function getRefreshToken(): string | null {
    return localStorage.getItem('refresh')
  }

  export function logout() {
    clearIaChatStorage()
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
  }

export type AdminAccountStatus = 'pending' | 'active' | 'blocked'

export type AdminUser = {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  telefono: string
  foto?: string | null
  estado_cuenta: AdminAccountStatus
  estado_cuenta_label: string
  tipo_cuenta: AccountTier
  tipo_cuenta_label: string
  fecha_expiracion: string | null
  is_expired: boolean
  dias_restantes: number | null
  is_staff: boolean
  date_joined: string
  last_login: string | null
}

export type AdminUserUpdatePayload = {
  first_name?: string
  last_name?: string
  email?: string
  telefono?: string
  estado_cuenta?: AdminAccountStatus
  tipo_cuenta?: AccountTier
  fecha_expiracion?: string | null
  duracion?: string | number | null
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await authFetch('/api/admin/usuarios/')
  if (!res.ok) throw new Error('No se pudo cargar la lista de usuarios')
  return res.json()
}

export async function updateAdminUser(id: number, data: AdminUserUpdatePayload): Promise<AdminUser> {
  const res = await authFetch(`/api/admin/usuarios/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export async function deleteAdminUser(id: number): Promise<void> {
  const res = await authFetch(`/api/admin/usuarios/${id}/`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
}