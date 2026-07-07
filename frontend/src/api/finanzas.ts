import { authFetch } from './auth'

export type ApiCategory = {
  id: number
  nombre: string
  tipo: 'income' | 'expense'
}

export type ApiTransaction = {
  id: number
  categoria: number | null
  presupuesto: number | null
  presupuesto_nombre: string | null
  recurrente: number | null
  recurrente_nombre: string | null
  tipo: 'income' | 'expense' | 'saving'
  monto: string
  fecha: string
  descripcion: string
  creado_en: string
  actualizado_en: string
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await authFetch('/api/categorias/')
  if (!res.ok) throw new Error('No se pudieron cargar categorías')
  return res.json()
}

export async function fetchTransactions(): Promise<ApiTransaction[]> {
  const res = await authFetch('/api/transacciones/')
  if (!res.ok) throw new Error('No se pudieron cargar transacciones')
  return res.json()
}

export type TransactionWritePayload = {
  categoria?: number | null
  presupuesto?: number | null
  recurrente?: number | null
  tipo: 'income' | 'expense'
  monto: string
  fecha: string
  descripcion: string
}

function formatApiError(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback
  const record = body as Record<string, unknown>
  if (typeof record.detail === 'string') return record.detail
  const parts: string[] = []
  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value)) {
      parts.push(`${key}: ${value.map(String).join(', ')}`)
    } else if (typeof value === 'string') {
      parts.push(value)
    }
  }
  return parts.length > 0 ? parts.join(' · ') : fallback
}

export async function createTransaction(data: TransactionWritePayload): Promise<ApiTransaction> {
  const res = await authFetch('/api/transacciones/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatApiError(err, 'No se pudo crear la transacción.'))
  }
  return res.json()
}

export async function updateTransaction(
  id: number,
  data: Partial<TransactionWritePayload>,
): Promise<ApiTransaction> {
  const res = await authFetch(`/api/transacciones/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatApiError(err, 'No se pudo actualizar la transacción.'))
  }
  return res.json()
}

export async function deleteTransaction(id: number): Promise<void> {
  const res = await authFetch(`/api/transacciones/${id}/`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(formatApiError(err, 'No se pudo eliminar la transacción.'))
  }
}