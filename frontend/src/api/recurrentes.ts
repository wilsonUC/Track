import { authFetch } from './auth'
import {
  formatApiError,
  parseSaldoInsuficienteError,
  type SaldoInsuficienteAhorrosError,
} from './finanzas'

export type ApiRecurrente = {
  id: number
  nombre: string
  monto: string
  monto_base?: string
  tiene_ajuste_mes?: boolean
  tipo: 'income' | 'expense'
  dia_pago: number
  categoria: number
  categoria_nombre: string
  permite_parciales: boolean
  fecha_inicio: string | null
  fecha_fin: string | null
  activo: boolean
  registrado_mes: boolean
  vencido: boolean
  mes_anterior_sin_registrar: string | null
  activo_en_mes: boolean
  estado_periodo: 'activo' | 'no_iniciado' | 'finalizado' | 'futuro'
  monto_pagado: number
  abonos: { id: number; monto: number; fecha: string; descripcion: string }[]
  creado_en: string
  actualizado_en: string
}

export async function fetchRecurrentes(mes?: string, incluirInactivos?: boolean): Promise<ApiRecurrente[]> {
  const params = new URLSearchParams()
  if (mes) params.append('mes', mes)
  if (incluirInactivos) params.append('incluir_inactivos', 'true')
  const queryStr = params.toString()
  const url = queryStr ? `/api/recurrentes/?${queryStr}` : '/api/recurrentes/'
  const res = await authFetch(url)
  if (!res.ok) throw new Error('No se pudieron cargar los recurrentes')
  return res.json()
}

export async function createRecurrente(
  data: {
    nombre: string
    monto: string
    tipo: 'income' | 'expense'
    dia_pago: number
    categoria: number
    fecha_inicio?: string | null
    fecha_fin?: string | null
    permite_parciales?: boolean
  },
  mes?: string,
): Promise<ApiRecurrente> {
  const url = mes ? `/api/recurrentes/?mes=${mes}` : '/api/recurrentes/'
  const res = await authFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export async function updateRecurrente(
  id: number,
  data: {
    nombre?: string
    monto?: string
    tipo?: 'income' | 'expense'
    dia_pago?: number
    categoria?: number
    fecha_inicio?: string | null
    fecha_fin?: string | null
    activo?: boolean
    permite_parciales?: boolean
    solo_este_mes?: boolean
  },
  mes?: string,
): Promise<ApiRecurrente> {
  const url = mes ? `/api/recurrentes/${id}/?mes=${mes}` : `/api/recurrentes/${id}/`
  const res = await authFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export type RegistrarPagoOptions = {
  monto?: string
  fecha?: string
  meta_liberar_id?: number | null
  liberar_de_ahorro_libre?: boolean
}

export async function registrarPagoRecurrente(
  id: number,
  montoOrOptions?: string | RegistrarPagoOptions,
  fecha?: string,
): Promise<ApiRecurrente> {
  const payload: Record<string, unknown> = {}
  let mesQuery = fecha

  if (typeof montoOrOptions === 'string') {
    if (montoOrOptions) payload.monto = montoOrOptions
    if (fecha) payload.fecha = fecha
  } else if (montoOrOptions && typeof montoOrOptions === 'object') {
    if (montoOrOptions.monto) payload.monto = montoOrOptions.monto
    if (montoOrOptions.fecha) {
      payload.fecha = montoOrOptions.fecha
      mesQuery = montoOrOptions.fecha
    }
    if (montoOrOptions.meta_liberar_id !== undefined && montoOrOptions.meta_liberar_id !== null) {
      payload.meta_liberar_id = montoOrOptions.meta_liberar_id
    }
    if (montoOrOptions.liberar_de_ahorro_libre) {
      payload.liberar_de_ahorro_libre = true
    }
  }

  const url = mesQuery ? `/api/recurrentes/${id}/registrar-pago/?mes=${mesQuery}` : `/api/recurrentes/${id}/registrar-pago/`
  const res = await authFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const errorObj = new Error(formatApiError(err, 'No se pudo registrar el pago.')) as Error & {
      data?: unknown
      insuficienteData?: SaldoInsuficienteAhorrosError | null
    }
    errorObj.data = err
    errorObj.insuficienteData = parseSaldoInsuficienteError(err)
    throw errorObj
  }
  return res.json()
}

export async function desmarcarPagoRecurrente(id: number, fecha?: string): Promise<ApiRecurrente> {
  const url = fecha ? `/api/recurrentes/${id}/desmarcar-pago/?mes=${fecha}` : `/api/recurrentes/${id}/desmarcar-pago/`
  const res = await authFetch(url, {
    method: 'POST',
    body: JSON.stringify(fecha ? { fecha } : {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
  return res.json()
}

export type ApiCuentasAtrasadasItem = {
  id: string
  id_recurrente: number
  nombre: string
  categoria: string
  mes_atraso: string
  fecha_pago: string
  acumulado: number
}

export type ApiCuentasAtrasadas = {
  total_pagar: number
  total_cobrar: number
  deudas: ApiCuentasAtrasadasItem[]
  cobros: ApiCuentasAtrasadasItem[]
}

export async function fetchCuentasAtrasadas(mes?: string): Promise<ApiCuentasAtrasadas> {
  const url = mes ? `/api/recurrentes/cuentas-atrasadas/?mes=${mes}` : '/api/recurrentes/cuentas-atrasadas/'
  const res = await authFetch(url)
  if (!res.ok) throw new Error('No se pudieron cargar las cuentas atrasadas')
  return res.json()
}
