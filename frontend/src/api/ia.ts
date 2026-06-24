import { authFetch } from './auth'
import type { IaHistorialItem } from '../components/ia/iaTypes'

export async function sendIaMessage(
  mensaje: string,
  historial: IaHistorialItem[],
): Promise<string> {
  const res = await authFetch('/api/ia/chat/', {
    method: 'POST',
    body: JSON.stringify({ mensaje, historial }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const detalle =
      typeof data.detalle === 'string'
        ? data.detalle
        : 'No se pudo obtener respuesta del asistente.'
    throw new Error(detalle)
  }

  if (typeof data.respuesta !== 'string' || !data.respuesta.trim()) {
    throw new Error('Respuesta vacía del asistente.')
  }

  return data.respuesta.trim()
}
