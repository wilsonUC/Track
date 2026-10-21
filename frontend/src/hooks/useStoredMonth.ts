import { useCallback, useState } from 'react'

/**
 * Hook para persistir la fecha de referencia mensual (fechaRef) en localStorage
 * de forma independiente por página o componente (ej: presupuestos, recurrentes, metas).
 */
export function useStoredMonth(key: string): [Date, (action: Date | ((prev: Date) => Date)) => void] {
  const [fechaRef, setFechaRefState] = useState<Date>(() => {
    try {
      const raw = localStorage.getItem(`track_month_ref_${key}`)
      if (raw) {
        const d = new Date(raw)
        if (!isNaN(d.getTime())) {
          return d
        }
      }
    } catch {
      // Ignorar errores en entornos con localStorage restringido
    }
    const d = new Date()
    d.setDate(1)
    return d
  })

  const setFechaRef = useCallback(
    (action: Date | ((prev: Date) => Date)) => {
      setFechaRefState((prev) => {
        const next = typeof action === 'function' ? action(prev) : action
        try {
          localStorage.setItem(`track_month_ref_${key}`, next.toISOString())
        } catch {
          // Ignorar errores de cuota
        }
        return next
      })
    },
    [key],
  )

  return [fechaRef, setFechaRef]
}
