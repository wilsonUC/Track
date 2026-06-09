import { createWelcomeMessage } from '../components/ia/iaConstants'
import type { IaMensaje } from '../components/ia/iaTypes'
import { getAccessToken } from '../api/auth'

const STORAGE_PREFIX = 'finanzastrack:ia-chat'

function storageKey(): string {
  const token = getAccessToken()
  if (!token) return `${STORAGE_PREFIX}:guest`

  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { user_id?: number }
    return `${STORAGE_PREFIX}:${payload.user_id ?? 'user'}`
  } catch {
    return `${STORAGE_PREFIX}:user`
  }
}

function isValidMensaje(value: unknown): value is IaMensaje {
  if (!value || typeof value !== 'object') return false
  const m = value as IaMensaje
  return (
    typeof m.id === 'number' &&
    (m.remitente === 'USER' || m.remitente === 'IA') &&
    typeof m.texto === 'string' &&
    typeof m.fecha === 'string'
  )
}

export function loadIaChatMessages(): IaMensaje[] | null {
  try {
    const raw = sessionStorage.getItem(storageKey())
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    if (!parsed.every(isValidMensaje)) return null

    return parsed
  } catch {
    return null
  }
}

export function saveIaChatMessages(mensajes: IaMensaje[]) {
  try {
    sessionStorage.setItem(storageKey(), JSON.stringify(mensajes))
  } catch {
    // sessionStorage lleno o bloqueado — ignorar
  }
}

export function clearIaChatStorage() {
  try {
    sessionStorage.removeItem(storageKey())
  } catch {
    // ignorar
  }
}

export function getInitialIaMessages(): IaMensaje[] {
  return loadIaChatMessages() ?? [createWelcomeMessage()]
}
