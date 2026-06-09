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
