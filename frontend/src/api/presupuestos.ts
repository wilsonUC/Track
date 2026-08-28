import { authFetch } from './auth'

export type PresupuestoEstado = 'ok' | 'alerta' | 'excedido'

export type ApiPresupuestoConsumo = {
  id: number
  monto: number
  fecha: string
  descripcion: string
}

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
  consumos?: ApiPresupuestoConsumo[]
  creado_en: string
  actualizado_en: string
}

export async function fetchPresupuestos(mes?: string): Promise<ApiPresupuesto[]> {
  const url = mes ? `/api/presupuestos/?mes=${encodeURIComponent(mes)}` : '/api/presupuestos/'
  const res = await authFetch(url)
  if (!res.ok) throw new Error('No se pudieron cargar los presupuestos')
  return res.json()
}

export async function createPresupuesto(data: {
  nombre: string
  limite: string
  monto_rapido: string
  categoria_referencia?: number | null
}): Promise<ApiPresupuesto> {
  const res = await authFetch('/api/presupuestos/', {
    method: 'POST',
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
  const res = await authFetch(`/api/presupuestos/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export async function registrarGastoRapido(presupuestoId: number): Promise<ApiPresupuesto> {
  const res = await authFetch(`/api/presupuestos/${presupuestoId}/gasto-rapido/`, {
    method: 'POST',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export async function limpiarConsumosPresupuesto(presupuestoId: number, mes?: string): Promise<ApiPresupuesto> {
  const url = mes
    ? `/api/presupuestos/${presupuestoId}/limpiar-consumos/?mes=${encodeURIComponent(mes)}`
    : `/api/presupuestos/${presupuestoId}/limpiar-consumos/`
  const res = await authFetch(url, {
    method: 'POST',
    body: JSON.stringify({ mes }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}
