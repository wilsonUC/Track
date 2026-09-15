export type IaRemitente = 'USER' | 'IA'

export type IaMensaje = {
  id: number
  remitente: IaRemitente
  texto: string
  fecha: string
}

export type IaHistorialItem = {
  rol: 'user' | 'assistant'
  contenido: string
}

export type IaCuota = {
  tipo_cuenta: 'basico' | 'avanzado'
  es_ilimitado: boolean
  limite_diario: number | null
  usados_hoy: number
  restantes_hoy: number | null
  limite_alcanzado: boolean
}

