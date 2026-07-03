import type { TransactionWritePayload } from '../api/finanzas'
import type { EnrichedTransaction } from './dashboardMetrics'

export type TransactionFormValues = {
  amount: string
  date: string
  description: string
  categoryId: number | ''
}

export function formValuesFromTransaction(t: EnrichedTransaction): TransactionFormValues {
  return {
    amount: t.monto,
    date: t.fecha,
    description: t.descripcion,
    categoryId: t.categoria ?? '',
  }
}

export function buildTransactionPayload(
  t: EnrichedTransaction,
  form: TransactionFormValues,
): TransactionWritePayload {
  const base = {
    tipo: t.tipo as 'income' | 'expense',
    monto: form.amount,
    fecha: form.date,
    descripcion: form.description,
  }

  if (t.esPresupuesto) {
    return {
      ...base,
      presupuesto: t.presupuesto,
      categoria: null,
      recurrente: null,
    }
  }

  if (t.esRecurrente) {
    return {
      ...base,
      recurrente: t.recurrente,
      categoria: t.categoria,
      presupuesto: null,
    }
  }

  return {
    ...base,
    categoria: form.categoryId === '' ? null : form.categoryId,
    presupuesto: null,
    recurrente: null,
  }
}
