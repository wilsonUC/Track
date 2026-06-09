import { getAccessToken } from './auth'
import type { IaHistorialItem } from '../components/ia/iaTypes'

const API = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export async function sendIaMessage(
  mensaje: string,
  historial: IaHistorialItem[],
): Promise<string> {
  const token = getAccessToken()
  if (!token) throw new Error('No hay sesión')

  const res = await fetch(`${API}/api/ia/chat/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
