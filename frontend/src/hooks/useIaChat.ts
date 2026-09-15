import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { getIaCuota, sendIaMessage } from '../api/ia'
import { createWelcomeMessage, formatIaTime } from '../components/ia/iaConstants'
import type { IaCuota, IaHistorialItem, IaMensaje } from '../components/ia/iaTypes'
import {
  clearIaChatStorage,
  getInitialIaMessages,
  saveIaChatMessages,
} from '../utils/iaChatStorage'

function toHistorial(mensajes: IaMensaje[]): IaHistorialItem[] {
  const welcome = createWelcomeMessage().texto
  return mensajes
    .filter((m) => !(m.remitente === 'IA' && m.texto === welcome))
    .map((m) => ({
      rol: m.remitente === 'USER' ? 'user' : 'assistant',
      contenido: m.texto,
    }))
}

export function useIaChat() {
  const [mensajes, setMensajes] = useState<IaMensaje[]>(getInitialIaMessages)
  const [input, setInput] = useState('')
  const [estaCargando, setEstaCargando] = useState(false)
  const [error, setError] = useState('')
  const [cuota, setCuota] = useState<IaCuota | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const refrescarCuota = useCallback(async () => {
    try {
      const data = await getIaCuota()
      setCuota(data)
    } catch {
      // Ignorar fallo de cuota inicial silenciosamente
    }
  }, [])

  useEffect(() => {
    refrescarCuota()
  }, [refrescarCuota])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, estaCargando])

  useEffect(() => {
    if (!estaCargando) {
      saveIaChatMessages(mensajes)
    }
  }, [mensajes, estaCargando])

  const limpiarChat = useCallback(() => {
    clearIaChatStorage()
    setMensajes([createWelcomeMessage()])
    setInput('')
    setError('')
  }, [])

  const manejarEnviar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!input.trim() || estaCargando) return

      // Si es plan básico y ya no quedan mensajes
      if (cuota && !cuota.es_ilimitado && cuota.restantes_hoy !== null && cuota.restantes_hoy <= 0) {
        const mensajeAviso: IaMensaje = {
          id: Date.now(),
          remitente: 'IA',
          texto: 'Has alcanzado el límite diario de 6 mensajes de tu plan básico. Pásate al plan Avanzado para consultas ilimitadas.',
          fecha: formatIaTime(),
        }
        setMensajes((prev) => [...prev, mensajeAviso])
        return
      }

      const mensajeUsuario: IaMensaje = {
        id: Date.now(),
        remitente: 'USER',
        texto: input.trim(),
        fecha: formatIaTime(),
      }

      const historial = toHistorial(mensajes)
      const pregunta = input.trim()

      setMensajes((prev) => [...prev, mensajeUsuario])
      setInput('')
      setEstaCargando(true)
      setError('')

      try {
        const res = await sendIaMessage(pregunta, historial)
        if (res.cuota) {
          setCuota(res.cuota)
        }
        const mensajeIa: IaMensaje = {
          id: Date.now() + 1,
          remitente: 'IA',
          texto: res.respuesta,
          fecha: formatIaTime(),
        }
        setMensajes((prev) => [...prev, mensajeIa])
      } catch (err: unknown) {
        const anyErr = err as { message?: string; cuota?: IaCuota }
        if (anyErr.cuota) {
          setCuota(anyErr.cuota)
        }
        const detalle = anyErr.message || 'Error desconocido'
        setError(detalle)
        const mensajeError: IaMensaje = {
          id: Date.now() + 1,
          remitente: 'IA',
          texto: `No pude procesar tu consulta: ${detalle}`,
          fecha: formatIaTime(),
        }
        setMensajes((prev) => [...prev, mensajeError])
      } finally {
        setEstaCargando(false)
      }
    },
    [cuota, estaCargando, input, mensajes],
  )

  return {
    mensajes,
    input,
    setInput,
    estaCargando,
    error,
    cuota,
    refrescarCuota,
    chatEndRef,
    limpiarChat,
    manejarEnviar,
  }
}

