import { useMemo, useState } from 'react'
import {
  formatDateRangeLabel,
  getDateRangeForPreset,
  toISODate,
  type DatePreset,
  type DateRange,
} from '../utils/dateFilters'

type UseDateFilterOptions = {
  defaultPreset?: DatePreset
}

export function useDateFilter({ defaultPreset = 'month' }: UseDateFilterOptions = {}) {
  const [preset, setPreset] = useState<DatePreset>(defaultPreset)
  const [customStart, setCustomStart] = useState(() => {
    const now = new Date()
    return toISODate(new Date(now.getFullYear(), now.getMonth(), 1))
  })
  const [customEnd, setCustomEnd] = useState(() => toISODate(new Date()))

  const range: DateRange = useMemo(() => {
    if (preset === 'custom') {
      return getDateRangeForPreset('custom', new Date(), { start: customStart, end: customEnd })
    }
    return getDateRangeForPreset(preset)
  }, [preset, customStart, customEnd])

  const label = useMemo(() => formatDateRangeLabel(preset, range), [preset, range])

  return {
    preset,
    setPreset,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    range,
    label,
  }
}
