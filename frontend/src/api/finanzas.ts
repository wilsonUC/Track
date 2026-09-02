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

export type SaldoInsuficienteAhorrosError = {
  codigo: 'saldo_insuficiente_con_ahorros'
  saldo_actual: number
  faltante: number
  monto_gasto: number
  libre_ahorros: number
  total_ahorros: number
  metas: { id: number; nombre: string; monto_disponible: number }[]
  detalle: string
}

export function parseSaldoInsuficienteError(err: unknown): SaldoInsuficienteAhorrosError | null {
  if (!err || typeof err !== 'object') return null
  const record = err as Record<string, unknown>
  const getVal = (val: unknown) => (Array.isArray(val) ? val[0] : val)
  const codigo = String(getVal(record.codigo) || '')
  if (codigo !== 'saldo_insuficiente_con_ahorros') return null

  const getNum = (val: unknown) => Number(getVal(val)) || 0
  const metasRaw = (Array.isArray(record.metas) ? record.metas : []) as Record<string, unknown>[]
  const metas = metasRaw.map((m) => ({
    id: Number(getVal(m.id)),
    nombre: String(getVal(m.nombre)),
    monto_disponible: Number(getVal(m.monto_disponible)) || 0,
  }))

  return {
    codigo: 'saldo_insuficiente_con_ahorros',
    saldo_actual: getNum(record.saldo_actual),
    faltante: getNum(record.faltante),
    monto_gasto: getNum(record.monto_gasto),
    libre_ahorros: getNum(record.libre_ahorros),
    total_ahorros: getNum(record.total_ahorros),
    metas,
    detalle: String(getVal(record.detalle) || ''),
  }
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
  meta_liberar_id?: number | null
  liberar_de_ahorro_libre?: boolean
  liberar_todo?: boolean
}

export function formatApiError(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback
  const record = body as Record<string, unknown>
  if (typeof record.detail === 'string') return record.detail
  if (typeof record.detalle === 'string') return record.detalle
  const parts: string[] = []
  for (const [key, value] of Object.entries(record)) {
    if (key === 'codigo' || key === 'metas') continue
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
    const errorObj = new Error(formatApiError(err, 'No se pudo crear la transacción.')) as Error & {
      data?: unknown
      insuficienteData?: SaldoInsuficienteAhorrosError | null
    }
    errorObj.data = err
    errorObj.insuficienteData = parseSaldoInsuficienteError(err)
    throw errorObj
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
    const errorObj = new Error(formatApiError(err, 'No se pudo actualizar la transacción.')) as Error & {
      data?: unknown
      insuficienteData?: SaldoInsuficienteAhorrosError | null
    }
    errorObj.data = err
    errorObj.insuficienteData = parseSaldoInsuficienteError(err)
    throw errorObj
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