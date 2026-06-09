import type { IaMensaje } from './iaTypes'

export function formatIaTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function createWelcomeMessage(): IaMensaje {
  return {
    id: 1,
    remitente: 'IA',
    texto:
      '¡Hola! Soy tu asistente de FinanzasTrack. Tengo acceso a tus ingresos, gastos y transacciones recientes para ayudarte con análisis, alertas y consejos. ¿Qué quieres revisar hoy?',
    fecha: formatIaTime(),
  }
}
