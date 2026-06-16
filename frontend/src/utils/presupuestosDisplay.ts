import type { ApiPresupuesto } from '../api/presupuestos'

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
  }
}
