import { useCallback, useMemo, useState } from 'react'
import {
  formatDateRangeLabel,
  formatPeriodStepperLabel,
  getDateRangeForPreset,
  getMondayOfWeek,
  toISODate,
  type DatePreset,
  type DateRange,
} from '../utils/dateFilters'

type UseDateFilterOptions = {
  defaultPreset?: DatePreset
}

export function useDateFilter({ defaultPreset = 'month' }: UseDateFilterOptions = {}) {
  const [preset, setPresetState] = useState<DatePreset>(defaultPreset)
  const [refDate, setRefDate] = useState<Date>(() => new Date())
  const [customStart, setCustomStart] = useState(() => {
    const now = new Date()
    return toISODate(new Date(now.getFullYear(), now.getMonth(), 1))
  })
  const [customEnd, setCustomEnd] = useState(() => toISODate(new Date()))

  const setPreset = useCallback((newPreset: DatePreset) => {
    setPresetState(newPreset)
    setRefDate(new Date())
  }, [])

  const prevPeriod = useCallback(() => {
    if (preset === 'total' || preset === 'custom') {
      setPresetState('month')
    }
    setRefDate((prev) => {
      const d = new Date(prev)
      if (preset === 'month' || preset === 'total' || preset === 'custom') {
        d.setMonth(d.getMonth() - 1)
      } else if (preset === 'week') {
        d.setDate(d.getDate() - 7)
      } else if (preset === 'today' || preset === 'yesterday') {
        d.setDate(d.getDate() - 1)
      }
      return d
    })
  }, [preset])

  const nextPeriod = useCallback(() => {
    if (preset === 'total' || preset === 'custom') {
      setPresetState('month')
    }
    setRefDate((prev) => {
      const d = new Date(prev)
      if (preset === 'month' || preset === 'total' || preset === 'custom') {
        d.setMonth(d.getMonth() + 1)
      } else if (preset === 'week') {
        d.setDate(d.getDate() + 7)
      } else if (preset === 'today' || preset === 'yesterday') {
        d.setDate(d.getDate() + 1)
      }
      return d
    })
  }, [preset])

  const resetToCurrent = useCallback(() => {
    setRefDate(new Date())
  }, [])

  const isCurrentPeriod = useMemo(() => {
    const now = new Date()
    if (preset === 'month' || preset === 'total' || preset === 'custom') {
      return refDate.getMonth() === now.getMonth() && refDate.getFullYear() === now.getFullYear()
    }
    if (preset === 'week') {
      const m1 = getMondayOfWeek(refDate).getTime()
      const m2 = getMondayOfWeek(now).getTime()
      return Math.abs(m1 - m2) < 24 * 60 * 60 * 1000
    }
    if (preset === 'today') {
      return toISODate(refDate) === toISODate(now)
    }
    return false
  }, [preset, refDate])

  const range: DateRange = useMemo(() => {
    if (preset === 'custom') {
      return getDateRangeForPreset('custom', refDate, { start: customStart, end: customEnd })
    }
    return getDateRangeForPreset(preset, refDate)
  }, [preset, refDate, customStart, customEnd])

  const label = useMemo(() => formatDateRangeLabel(preset, range, refDate), [preset, range, refDate])
  const periodLabel = useMemo(() => formatPeriodStepperLabel(preset, refDate), [preset, refDate])

  return {
    preset,
    setPreset,
    refDate,
    prevPeriod,
    nextPeriod,
    resetToCurrent,
    isCurrentPeriod,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    range,
    label,
    periodLabel,
  }
}

