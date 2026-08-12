import { authFetch } from './auth'

export type TemaPreferencia = 'claro' | 'oscuro' | 'sistema'

export type PreferenciasUsuario = {
  tema: TemaPreferencia
  vista_compacta: boolean
  moneda: string
  dia_inicio_mes: number
  mostrar_decimales: boolean
  limitar_saldo_negativo: boolean
  permitir_asignacion_directa_metas: boolean
  actualizado_en: string
}

export type PreferenciasUpdate = Partial<
  Pick<
    PreferenciasUsuario,
    | 'tema'
    | 'vista_compacta'
    | 'moneda'
    | 'dia_inicio_mes'
    | 'mostrar_decimales'
    | 'limitar_saldo_negativo'
    | 'permitir_asignacion_directa_metas'
  >
>


function formatError(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback
  const record = body as Record<string, unknown>
  const parts: string[] = []
  for (const value of Object.values(record)) {
    if (Array.isArray(value)) parts.push(value.map(String).join(', '))
    else if (typeof value === 'string') parts.push(value)
  }
  return parts.length > 0 ? parts.join(' · ') : fallback
}

export async function fetchPreferencias(): Promise<PreferenciasUsuario> {
  const res = await authFetch('/api/preferencias/')
  if (!res.ok) throw new Error('No se pudieron cargar las preferencias.')
  return res.json()
}

export async function updatePreferencias(data: PreferenciasUpdate): Promise<PreferenciasUsuario> {
  const res = await authFetch('/api/preferencias/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatError(err, 'No se pudieron guardar las preferencias.'))
  }
  return res.json()
}
