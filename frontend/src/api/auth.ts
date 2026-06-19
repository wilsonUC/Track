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

function authHeaders() {
  const token = getAccessToken()
  if (!token) throw new Error('No hay sesión')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch(`${API}/api/perfil/`, { headers: authHeaders() })
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
  const res = await fetch(`${API}/api/perfil/`, {
    method: 'PATCH',
    headers: authHeaders(),
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
  const res = await fetch(`${API}/api/perfil/cambiar-password/`, {
    method: 'POST',
    headers: authHeaders(),
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
    if (!res.ok) throw new Error('Usuario o contraseña incorrectos')
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

  export function logout() {
    clearIaChatStorage()
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
  }