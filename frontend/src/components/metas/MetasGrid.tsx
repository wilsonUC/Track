import type { MetaCardView } from '../../utils/metasDisplay'
import { MetaCard } from './MetaCard'

type MetasGridProps = {
  metas: MetaCardView[]
  onAsignar: (meta: MetaCardView) => void
  onDesasignar: (meta: MetaCardView) => void
  onEditar: (meta: MetaCardView) => void
}

export function MetasGrid({ metas, onAsignar, onDesasignar, onEditar }: MetasGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {metas.map((meta) => (
        <MetaCard
          key={meta.id}
          meta={meta}
          onAsignar={onAsignar}
          onDesasignar={onDesasignar}
          onEditar={onEditar}
        />
      ))}
    </div>
  )
}
