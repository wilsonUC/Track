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
  tipo: 'income' | 'expense'
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

export async function createTransaction(data: {
  categoria?: number | null
  presupuesto?: number | null
  tipo: 'income' | 'expense'
  monto: string
  fecha: string
  descripcion: string
}): Promise<ApiTransaction> {
  const res = await authFetch('/api/transacciones/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}