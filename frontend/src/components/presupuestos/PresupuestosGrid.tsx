import type { PresupuestoCardView } from './presupuestosTypes'
import { PresupuestoCard } from './PresupuestoCard'

type PresupuestosGridProps = {
  presupuestos: PresupuestoCardView[]
  onRegistrarGasto: (id: number) => void
  onEditar: (presupuesto: PresupuestoCardView) => void
  onAlternarActivo?: (id: number, activo: boolean) => void
  onDesactivar?: (presupuesto: PresupuestoCardView) => void
  onReactivar?: (presupuesto: PresupuestoCardView) => void
  onEliminar?: (presupuesto: PresupuestoCardView) => void
  onEliminarConsumo?: (consumo: {
    id: number
    monto: number
    fecha: string
    presupuestoId: number
    presupuestoNombre: string
  }) => void
  onLimpiarConsumos?: (presupuesto: PresupuestoCardView) => void
  registrandoId?: number | null
  procesandoId?: number | null
  esMesActual?: boolean
  esMesPasado?: boolean
  esMesFuturo?: boolean
}

export function PresupuestosGrid({
  presupuestos,
  onRegistrarGasto,
  onEditar,
  onAlternarActivo,
  onDesactivar,
  onReactivar,
  onEliminar,
  onEliminarConsumo,
  onLimpiarConsumos,
  registrandoId,
  procesandoId,
  esMesActual = true,
  esMesPasado = false,
  esMesFuturo = false,
}: PresupuestosGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {presupuestos.map((presupuesto) => (
        <PresupuestoCard
          key={presupuesto.id}
          presupuesto={presupuesto}
          onRegistrarGasto={onRegistrarGasto}
          onEditar={onEditar}
          onAlternarActivo={onAlternarActivo}
          onDesactivar={onDesactivar}
          onReactivar={onReactivar}
          onEliminar={onEliminar}
          onEliminarConsumo={onEliminarConsumo}
          onLimpiarConsumos={onLimpiarConsumos}
          registrando={registrandoId === presupuesto.id}
          procesando={procesandoId === presupuesto.id}
          esMesActual={esMesActual}
          esMesPasado={esMesPasado}
          esMesFuturo={esMesFuturo}
        />
      ))}
    </div>
  )
}
