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
  fechaLimite: string | null
  fechaLimiteLabel: string | null
  iconCategory: string
  categoriaReferenciaId: number | null
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
    fechaLimite: m.fecha_limite,
    fechaLimiteLabel: m.fecha_limite ? formatShortDate(m.fecha_limite) : null,
    iconCategory: m.categoria_referencia_nombre ?? 'Otros',
    categoriaReferenciaId: m.categoria_referencia,
  }
}
