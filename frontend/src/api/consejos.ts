import { authFetch } from './auth'

export type ConsejoCategoria = 'AHORRO' | 'ALERTA' | 'INVERSIÓN' | 'GENERAL'
export type ConsejoImpacto = 'ALTO' | 'MEDIO' | 'OPTIMISTA'

export type ConsejoItem = {
  titulo: string
  descripcion: string
  categoria: ConsejoCategoria
  impacto: ConsejoImpacto
  pregunta_ia: string
}

export type ConsejosResponse = {
  puntaje: number
  resumen: string
  consejos: ConsejoItem[]
  generado_en: string
  desde_cache: boolean
}

export async function fetchConsejos(regenerar = false): Promise<ConsejosResponse> {
  const query = regenerar ? '?regenerar=1' : ''
  const res = await authFetch(`/api/consejos/${query}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detalle ?? 'No se pudieron cargar los consejos.')
  }
  return res.json()
}
