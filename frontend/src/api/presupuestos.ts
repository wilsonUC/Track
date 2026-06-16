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

export type PresupuestoEstado = 'ok' | 'alerta' | 'excedido'

export type ApiPresupuesto = {
  id: number
  nombre: string
  limite: string
  monto_rapido: string
  categoria_referencia: number | null
  categoria_referencia_nombre: string | null
  activo: boolean
  gastado: string
  porcentaje: number
  estado: PresupuestoEstado
  creado_en: string
  actualizado_en: string
}

export async function fetchPresupuestos(): Promise<ApiPresupuesto[]> {
  const res = await fetch(`${API}/api/presupuestos/`, { headers: authHeaders() })
  if (!res.ok) throw new Error('No se pudieron cargar los presupuestos')
  return res.json()
}

export async function createPresupuesto(data: {
  nombre: string
  limite: string
  monto_rapido: string
  categoria_referencia?: number | null
}): Promise<ApiPresupuesto> {
  const res = await fetch(`${API}/api/presupuestos/`, {
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

export async function updatePresupuesto(
  id: number,
  data: {
    nombre?: string
    limite?: string
    monto_rapido?: string
    categoria_referencia?: number | null
  },
): Promise<ApiPresupuesto> {
  const res = await fetch(`${API}/api/presupuestos/${id}/`, {
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

export async function registrarGastoRapido(presupuestoId: number): Promise<ApiPresupuesto> {
  const res = await fetch(`${API}/api/presupuestos/${presupuestoId}/gasto-rapido/`, {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}
