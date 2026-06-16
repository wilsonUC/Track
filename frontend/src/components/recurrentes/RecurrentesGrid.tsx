import { RecurrenteCard } from './RecurrenteCard'
import type { RecurrenteCardView } from './recurrentesTypes'

type RecurrentesGridProps = {
  recurrentes: RecurrenteCardView[]
  onAlternarPago: (id: number) => void
  onEditar: (recurrente: RecurrenteCardView) => void
  procesandoId?: number | null
}

export function RecurrentesGrid({
  recurrentes,
  onAlternarPago,
  onEditar,
  procesandoId,
}: RecurrentesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {recurrentes.map((recurrente) => (
        <RecurrenteCard
          key={recurrente.id}
          recurrente={recurrente}
          onAlternarPago={onAlternarPago}
          onEditar={onEditar}
          procesando={procesandoId === recurrente.id}
        />
      ))}
    </div>
  )
}
