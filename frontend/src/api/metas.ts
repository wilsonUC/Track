import { authFetch } from './auth'

export type MetaEstado = 'en_progreso' | 'completada' | 'vencida'

export type ApiMeta = {
  id: number
  nombre: string
  monto_objetivo: string
  fecha_inicio: string | null
  fecha_limite: string | null
  categoria_referencia: number | null
  categoria_referencia_nombre: string | null
  activo: boolean
  acumulado: string
  porcentaje: number
  completada: boolean
  estado: MetaEstado
  monto_sugerido_mensual: string | null
  creado_en: string
  actualizado_en: string
}

function formatError(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback
  const record = body as Record<string, unknown>
  if (typeof record.detalle === 'string') return record.detalle
  const parts: string[] = []
  for (const value of Object.values(record)) {
    if (Array.isArray(value)) parts.push(value.map(String).join(', '))
    else if (typeof value === 'string') parts.push(value)
  }
  return parts.length > 0 ? parts.join(' · ') : fallback
}

export async function fetchMetas(): Promise<ApiMeta[]> {
  const res = await authFetch('/api/metas/')
  if (!res.ok) throw new Error('No se pudieron cargar las metas')
  return res.json()
}

export async function createMeta(data: {
  nombre: string
  monto_objetivo: string
  fecha_inicio?: string | null
  fecha_limite?: string | null
  categoria_referencia?: number | null
}): Promise<ApiMeta> {
  const res = await authFetch('/api/metas/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatError(err, 'No se pudo crear la meta.'))
  }
  return res.json()
}

export async function updateMeta(
  id: number,
  data: {
    nombre?: string
    monto_objetivo?: string
    fecha_inicio?: string | null
    fecha_limite?: string | null
    categoria_referencia?: number | null
  },
): Promise<ApiMeta> {
  const res = await authFetch(`/api/metas/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatError(err, 'No se pudo actualizar la meta.'))
  }
  return res.json()
}

export async function asignarAhorroMeta(metaId: number, monto: string): Promise<ApiMeta> {
  const res = await authFetch(`/api/metas/${metaId}/asignar/`, {
    method: 'POST',
    body: JSON.stringify({ monto }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatError(err, 'No se pudo asignar el ahorro.'))
  }
  return res.json()
}

export async function desasignarAhorroMeta(metaId: number, monto: string): Promise<ApiMeta> {
  const res = await authFetch(`/api/metas/${metaId}/desasignar/`, {
    method: 'POST',
    body: JSON.stringify({ monto }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatError(err, 'No se pudo quitar la asignación.'))
  }
  return res.json()
}
