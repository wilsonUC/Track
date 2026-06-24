import { clearIaChatStorage } from '../utils/iaChatStorage'

const API = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export type LoginResponse = {
    access: string
    refresh: string
}

export type UserProfile = {
  username: string
  first_name: string
  last_name: string
  email: string
  telefono: string
  estado_cuenta: 'pending' | 'active' | 'blocked'
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

function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export async function authFetch(path: string, init: RequestInit = {}) {
  const token = getAccessToken()
  if (!token) throw new Error('No hay sesión')

  const url = path.startsWith('http') ? path : `${API}${path}`
  const request = (accessToken: string) =>
    fetch(url, {
      ...init,
      headers: buildAuthHeaders(accessToken, init.headers, init.body),
    })

  const res = await request(token)
  if (res.status !== 401) return res

  try {
    const newAccess = await refreshAccessToken()
    return request(newAccess)
  } catch (error) {
    logout()
    redirectToLogin()
    throw error
  }
}

export async function fetchProfile(): Promise<UserProfile> {
  const res = await authFetch('/api/perfil/')
  if (!res.ok) throw new Error('No se pudo cargar el perfil')
  return res.json()
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
  return res.json()
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
  estado_cuenta: AdminAccountStatus
  estado_cuenta_label: string
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