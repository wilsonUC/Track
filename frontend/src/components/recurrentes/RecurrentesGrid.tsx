import { useEffect, useState } from 'react'
import { RecurrenteCard } from './RecurrenteCard'
import type { RecurrenteCardView } from './recurrentesTypes'

type RecurrentesGridProps = {
  recurrentes: RecurrenteCardView[]
  onAlternarPago: (id: number) => void
  onEditar: (recurrente: RecurrenteCardView) => void
  onAlternarActivo: (id: number, activo: boolean) => void
  onEliminarAbono: (transactionId: number) => void
  onDesmarcarTodo: (id: number) => void
  procesandoId?: number | null
}

export function RecurrentesGrid({
  recurrentes,
  onAlternarPago,
  onEditar,
  onAlternarActivo,
  onEliminarAbono,
  onDesmarcarTodo,
  procesandoId,
}: RecurrentesGridProps) {
  const [cols, setCols] = useState(3)

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth < 768) {
        setCols(1)
      } else if (window.innerWidth < 1024) {
        setCols(2)
      } else {
        setCols(3)
      }
    }

    updateCols()
    window.addEventListener('resize', updateCols)
    return () => window.removeEventListener('resize', updateCols)
  }, [])

  const columns = Array.from({ length: cols }, () => [] as typeof recurrentes)
  recurrentes.forEach((item, index) => {
    columns[index % cols].push(item)
  })

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
      {columns.map((colItems, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-6">
          {colItems.map((recurrente) => (
            <RecurrenteCard
              key={recurrente.id}
              recurrente={recurrente}
              onAlternarPago={onAlternarPago}
              onEditar={onEditar}
              onAlternarActivo={onAlternarActivo}
              onEliminarAbono={onEliminarAbono}
              onDesmarcarTodo={onDesmarcarTodo}
              procesando={procesandoId === recurrente.id}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
