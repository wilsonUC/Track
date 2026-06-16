import { getAccessToken } from './auth'

const API = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

function authHeaders() {
  const token = getAccessToken()
  if (!token) throw new Error('No hay sesión')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export type ApiRecurrente = {
  id: number
  nombre: string
  monto: string
  tipo: 'income' | 'expense'
  dia_pago: number
  categoria: number
  categoria_nombre: string
  permite_parciales: boolean
  activo: boolean
  registrado_mes: boolean
  vencido: boolean
  mes_anterior_sin_registrar: string | null
  creado_en: string
  actualizado_en: string
}

export async function fetchRecurrentes(): Promise<ApiRecurrente[]> {
  const res = await fetch(`${API}/api/recurrentes/`, { headers: authHeaders() })
  if (!res.ok) throw new Error('No se pudieron cargar los recurrentes')
  return res.json()
}

export async function createRecurrente(data: {
  nombre: string
  monto: string
  tipo: 'income' | 'expense'
  dia_pago: number
  categoria: number
}): Promise<ApiRecurrente> {
  const res = await fetch(`${API}/api/recurrentes/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export async function updateRecurrente(
  id: number,
  data: {
    nombre?: string
    monto?: string
    tipo?: 'income' | 'expense'
    dia_pago?: number
    categoria?: number
  },
): Promise<ApiRecurrente> {
  const res = await fetch(`${API}/api/recurrentes/${id}/`, {
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

export async function registrarPagoRecurrente(
  id: number,
  monto?: string,
): Promise<ApiRecurrente> {
  const res = await fetch(`${API}/api/recurrentes/${id}/registrar-pago/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(monto ? { monto } : {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export async function desmarcarPagoRecurrente(id: number): Promise<ApiRecurrente> {
  const res = await fetch(`${API}/api/recurrentes/${id}/desmarcar-pago/`, {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}
