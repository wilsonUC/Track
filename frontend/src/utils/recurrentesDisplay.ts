import type { ApiRecurrente } from '../api/recurrentes'
import type { RecurrenteCardView } from '../components/recurrentes/recurrentesTypes'

export function mapRecurrenteToCard(r: ApiRecurrente): RecurrenteCardView {
  return {
    id: r.id,
    nombre: r.nombre,
    monto: Number(r.monto),
    tipo: r.tipo,
    diaPago: r.dia_pago,
    categoriaId: r.categoria,
    categoriaNombre: r.categoria_nombre,
    registradoMes: r.registrado_mes,
    vencido: r.vencido,
    mesAnteriorSinRegistrar: r.mes_anterior_sin_registrar,
  }
}

/** Texto amigable para el día de vencimiento/cobro (caso día 31 en febrero, etc.). */
export function textoDiaPago(dia: number): string {
  if (dia === 31) return '31 (o último día del mes)'
  if (dia === 30) return '30 (o último en febrero)'
  return `${dia} de cada mes`
}
