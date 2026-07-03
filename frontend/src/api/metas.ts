import { authFetch } from './auth'

export type MetaEstado = 'en_progreso' | 'completada' | 'vencida'

export type ApiMeta = {
  id: number
  nombre: string
  monto_objetivo: string
  fecha_limite: string | null
  monto_rapido: string
  categoria_referencia: number | null
  categoria_referencia_nombre: string | null
  activo: boolean
  acumulado: string
  porcentaje: number
  completada: boolean
  estado: MetaEstado
  creado_en: string
  actualizado_en: string
}

export async function fetchMetas(): Promise<ApiMeta[]> {
  const res = await authFetch('/api/metas/')
  if (!res.ok) throw new Error('No se pudieron cargar las metas')
  return res.json()
}

export async function createMeta(data: {
  nombre: string
  monto_objetivo: string
  fecha_limite?: string | null
  monto_rapido: string
  categoria_referencia?: number | null
}): Promise<ApiMeta> {
  const res = await authFetch('/api/metas/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export async function updateMeta(
  id: number,
  data: {
    nombre?: string
    monto_objetivo?: string
    fecha_limite?: string | null
    monto_rapido?: string
    categoria_referencia?: number | null
  },
): Promise<ApiMeta> {
  const res = await authFetch(`/api/metas/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export async function registrarAporteMeta(metaId: number, monto?: string): Promise<ApiMeta> {
  const res = await authFetch(`/api/metas/${metaId}/registrar-aporte/`, {
    method: 'POST',
    body: JSON.stringify(monto ? { monto } : {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export async function desmarcarAporteMeta(metaId: number): Promise<ApiMeta> {
  const res = await authFetch(`/api/metas/${metaId}/desmarcar-aporte/`, {
    method: 'POST',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}
