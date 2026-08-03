import type { ApiMeta } from '../api/metas'
import { formatShortDate } from './financeFormat'

export type MetaCardView = {
  id: number
  nombre: string
  objetivo: number
  acumulado: number
  porcentaje: number
  completada: boolean
  estado: ApiMeta['estado']
  fechaInicio: string | null
  fechaInicioLabel: string | null
  fechaLimite: string | null
  fechaLimiteLabel: string | null
  iconCategory: string
  categoriaReferenciaId: number | null
  montoSugeridoMensual: number | null
}

export function mapMetaToCard(m: ApiMeta): MetaCardView {
  return {
    id: m.id,
    nombre: m.nombre,
    objetivo: Number(m.monto_objetivo),
    acumulado: Number(m.acumulado),
    porcentaje: m.porcentaje,
    completada: m.completada,
    estado: m.estado,
    fechaInicio: m.fecha_inicio,
    fechaInicioLabel: m.fecha_inicio ? formatShortDate(m.fecha_inicio) : null,
    fechaLimite: m.fecha_limite,
    fechaLimiteLabel: m.fecha_limite ? formatShortDate(m.fecha_limite) : null,
    iconCategory: m.categoria_referencia_nombre ?? 'Otros',
    categoriaReferenciaId: m.categoria_referencia,
    montoSugeridoMensual: m.monto_sugerido_mensual ? Number(m.monto_sugerido_mensual) : null,
  }
}
