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
  fecha_inicio?: string | null
  fecha_fin?: string | null
  activo: boolean
  activo_en_mes?: boolean
  estado_periodo?: 'activo' | 'no_iniciado' | 'finalizado' | 'futuro'
  gastado: string
  porcentaje: number
  estado: PresupuestoEstado
  consumos?: ApiPresupuestoConsumo[]
  creado_en: string
  actualizado_en: string
}

export async function fetchPresupuestos(mes?: string, incluirInactivos?: boolean): Promise<ApiPresupuesto[]> {
  const params = new URLSearchParams()
  if (mes) params.append('mes', mes)
  if (incluirInactivos) params.append('incluir_inactivos', 'true')
  const queryStr = params.toString()
  const url = queryStr ? `/api/presupuestos/?${queryStr}` : '/api/presupuestos/'
  const res = await authFetch(url)
  if (!res.ok) throw new Error('No se pudieron cargar los presupuestos')
  return res.json()
}

export async function createPresupuesto(
  data: {
    nombre: string
    limite: string
    monto_rapido: string
    categoria_referencia?: number | null
    fecha_inicio?: string | null
    fecha_fin?: string | null
  },
  mes?: string,
): Promise<ApiPresupuesto> {
  const url = mes ? `/api/presupuestos/?mes=${encodeURIComponent(mes)}` : '/api/presupuestos/'
  const res = await authFetch(url, {
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
    fecha_inicio?: string | null
    fecha_fin?: string | null
    activo?: boolean
  },
  mes?: string,
): Promise<ApiPresupuesto> {
  const url = mes ? `/api/presupuestos/${id}/?mes=${encodeURIComponent(mes)}` : `/api/presupuestos/${id}/`
  const res = await authFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export type InfoEliminacionPresupuesto = {
  id: number
  nombre: string
  num_transacciones: number
  total_monto: number
}

export async function fetchInfoEliminacionPresupuesto(id: number): Promise<InfoEliminacionPresupuesto> {
  const res = await authFetch(`/api/presupuestos/${id}/info-eliminacion/`)
  if (!res.ok) throw new Error('No se pudo obtener la información de eliminación')
  return res.json()
}

export async function deletePresupuestoPermanente(
  id: number,
  modo?: 'eliminar_todo' | 'conservar_transacciones',
): Promise<void> {
  const url = modo ? `/api/presupuestos/${id}/?modo=${modo}` : `/api/presupuestos/${id}/`
  const res = await authFetch(url, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
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

export async function reactivarPresupuesto(
  presupuestoId: number,
  data: {
    fecha_inicio?: string | null
    fecha_fin?: string | null
    limite?: string
    desvincular_transacciones?: boolean
  },
  mes?: string,
): Promise<ApiPresupuesto> {
  const url = mes
    ? `/api/presupuestos/${presupuestoId}/reactivar/?mes=${encodeURIComponent(mes)}`
    : `/api/presupuestos/${presupuestoId}/reactivar/`
  const res = await authFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}
