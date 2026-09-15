import { authFetch } from './auth'
import type { IaCuota, IaHistorialItem } from '../components/ia/iaTypes'

export type SendIaMessageResponse = {
  respuesta: string
  cuota?: IaCuota
}

export async function getIaCuota(): Promise<IaCuota> {
  const res = await authFetch('/api/ia/chat/', {
    method: 'GET',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.detalle || 'No se pudo obtener el estado de la cuota.')
  }
  return data as IaCuota
}

export async function sendIaMessage(
  mensaje: string,
  historial: IaHistorialItem[],
): Promise<SendIaMessageResponse> {
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
    const err = new Error(detalle) as Error & { status?: number; cuota?: IaCuota; limite_alcanzado?: boolean }
    err.status = res.status
    if (data.cuota) {
      err.cuota = data.cuota
    }
    if (data.limite_alcanzado) {
      err.limite_alcanzado = true
    }
    throw err
  }

  if (typeof data.respuesta !== 'string' || !data.respuesta.trim()) {
    throw new Error('Respuesta vacía del asistente.')
  }

  return {
    respuesta: data.respuesta.trim(),
    cuota: data.cuota,
  }
}

