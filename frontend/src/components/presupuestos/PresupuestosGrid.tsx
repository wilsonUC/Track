import type { PresupuestoCardView } from './presupuestosTypes'
import { PresupuestoCard } from './PresupuestoCard'

type PresupuestosGridProps = {
  presupuestos: PresupuestoCardView[]
  onRegistrarGasto: (id: number) => void
  onEditar: (presupuesto: PresupuestoCardView) => void
  registrandoId?: number | null
}

export function PresupuestosGrid({
  presupuestos,
  onRegistrarGasto,
  onEditar,
  registrandoId,
}: PresupuestosGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {presupuestos.map((presupuesto) => (
        <PresupuestoCard
          key={presupuesto.id}
          presupuesto={presupuesto}
          onRegistrarGasto={onRegistrarGasto}
          onEditar={onEditar}
          registrando={registrandoId === presupuesto.id}
        />
      ))}
    </div>
  )
}
