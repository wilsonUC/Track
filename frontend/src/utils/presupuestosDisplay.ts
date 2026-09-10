import type { ApiPresupuesto, ApiPresupuestoConsumo } from '../api/presupuestos'

export type PresupuestoCardView = {
  id: number
  nombre: string
  limite: number
  gastado: number
  montoRapido: number
  porcentaje: number
  estado: ApiPresupuesto['estado']
  iconCategory: string
  categoriaReferenciaId: number | null
  fechaInicio?: string | null
  fechaFin?: string | null
  activo: boolean
  activoEnMes: boolean
  estadoPeriodo: 'activo' | 'no_iniciado' | 'finalizado' | 'futuro'
  consumos: ApiPresupuestoConsumo[]
}

export function mapPresupuestoToCard(p: ApiPresupuesto): PresupuestoCardView {
  return {
    id: p.id,
    nombre: p.nombre,
    limite: Number(p.limite),
    gastado: Number(p.gastado),
    montoRapido: Number(p.monto_rapido),
    porcentaje: p.porcentaje,
    estado: p.estado,
    iconCategory: p.categoria_referencia_nombre ?? 'Otros',
    categoriaReferenciaId: p.categoria_referencia,
    fechaInicio: p.fecha_inicio ?? null,
    fechaFin: p.fecha_fin ?? null,
    activo: p.activo,
    activoEnMes: p.activo_en_mes ?? true,
    estadoPeriodo: p.estado_periodo ?? 'activo',
    consumos: p.consumos ?? [],
  }
}
