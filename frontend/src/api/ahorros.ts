import { authFetch } from './auth'

export type ApiAhorro = {
  id: number
  monto: string
  fecha: string
  descripcion: string
  creado_en: string
}

export type MetaAsignada = {
  id: number
  nombre: string
  monto: string
}

export type ResumenAhorros = {
  total: string
  asignado: string
  libre: string
  /** Saldo histórico aún no apartado (ingresos − gastos − ahorros). */
  disponible: string
  /** @deprecated Usar `disponible`. Se mantiene por compatibilidad. */
  disponible_mes?: string
  metas_asignadas?: MetaAsignada[]
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

export async function fetchAhorros(): Promise<ApiAhorro[]> {
  const res = await authFetch('/api/ahorros/')
  if (!res.ok) throw new Error('No se pudieron cargar los ahorros.')
  return res.json()
}

export async function fetchResumenAhorros(): Promise<ResumenAhorros> {
  const res = await authFetch('/api/ahorros/resumen/')
  if (!res.ok) throw new Error('No se pudo cargar el resumen de ahorros.')
  return res.json()
}

export async function crearAhorro(data: {
  monto: string
  fecha: string
  descripcion?: string
}): Promise<ApiAhorro> {
  const res = await authFetch('/api/ahorros/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatError(err, 'No se pudo registrar el ahorro.'))
  }
  return res.json()
}

export async function eliminarAhorro(id: number): Promise<void> {
  const res = await authFetch(`/api/ahorros/${id}/`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatError(err, 'No se pudo eliminar el ahorro.'))
  }
}

export async function liberarMetaAhorro(metaId: number): Promise<{ ok: boolean; monto_liberado: number; resumen: ResumenAhorros }> {
  const res = await authFetch('/api/ahorros/liberar-meta/', {
    method: 'POST',
    body: JSON.stringify({ meta_id: metaId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatError(err, 'No se pudo liberar la meta.'))
  }
  return res.json()
}

export async function liberarTodasMetasAhorro(): Promise<{ ok: boolean; total_liberado: number; resumen: ResumenAhorros }> {
  const res = await authFetch('/api/ahorros/liberar-todas-metas/', {
    method: 'POST',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatError(err, 'No se pudieron liberar las metas.'))
  }
  return res.json()
}
