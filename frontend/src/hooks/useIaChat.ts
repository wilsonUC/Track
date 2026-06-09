import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { sendIaMessage } from '../api/ia'
import { createWelcomeMessage, formatIaTime } from '../components/ia/iaConstants'
import type { IaHistorialItem, IaMensaje } from '../components/ia/iaTypes'
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
  const chatEndRef = useRef<HTMLDivElement>(null)

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
        const respuesta = await sendIaMessage(pregunta, historial)
        const mensajeIa: IaMensaje = {
          id: Date.now() + 1,
          remitente: 'IA',
          texto: respuesta,
          fecha: formatIaTime(),
        }
        setMensajes((prev) => [...prev, mensajeIa])
      } catch (err) {
        const detalle = err instanceof Error ? err.message : 'Error desconocido'
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
    [estaCargando, input, mensajes],
  )

  return {
    mensajes,
    input,
    setInput,
    estaCargando,
    error,
    chatEndRef,
    limpiarChat,
    manejarEnviar,
  }
}
