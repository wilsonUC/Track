import type { MetaCardView } from '../../utils/metasDisplay'
import { MetaCard } from './MetaCard'

type MetasGridProps = {
  metas: MetaCardView[]
  onRegistrarAporte: (id: number) => void
  onEditar: (meta: MetaCardView) => void
  registrandoId: number | null
}

export function MetasGrid({ metas, onRegistrarAporte, onEditar, registrandoId }: MetasGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {metas.map((meta) => (
        <MetaCard
          key={meta.id}
          meta={meta}
          onRegistrarAporte={onRegistrarAporte}
          onEditar={onEditar}
          registrando={registrandoId === meta.id}
        />
      ))}
    </div>
  )
}
