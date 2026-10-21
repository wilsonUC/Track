import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  formatDateRangeLabel,
  formatPeriodStepperLabel,
  getDateRangeForPreset,
  getMondayOfWeek,
  toISODate,
  type DatePreset,
  type DateRange,
} from '../utils/dateFilters'

export type UseDateFilterOptions = {
  defaultPreset?: DatePreset
  storageKey?: string
}

function getStoredFilterState(storageKey?: string, defaultPreset: DatePreset = 'month') {
  if (!storageKey || typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`track_date_filter_${storageKey}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const validPresets: DatePreset[] = ['today', 'yesterday', 'week', 'month', 'total', 'custom']
    const preset = validPresets.includes(parsed.preset) ? (parsed.preset as DatePreset) : defaultPreset

    let refDate = new Date()
    if (parsed.refDate && preset !== 'today' && preset !== 'yesterday') {
      const parsedDate = new Date(parsed.refDate)
      if (!isNaN(parsedDate.getTime())) {
        refDate = parsedDate
      }
    }

    const customStart =
      typeof parsed.customStart === 'string' && parsed.customStart
        ? parsed.customStart
        : undefined
    const customEnd =
      typeof parsed.customEnd === 'string' && parsed.customEnd
        ? parsed.customEnd
        : undefined

    return { preset, refDate, customStart, customEnd }
  } catch {
    return null
  }
}

export function useDateFilter({ defaultPreset = 'month', storageKey }: UseDateFilterOptions = {}) {
  const initial = useMemo(() => getStoredFilterState(storageKey, defaultPreset), [storageKey, defaultPreset])

  const [preset, setPresetState] = useState<DatePreset>(() => initial?.preset ?? defaultPreset)
  const [refDate, setRefDate] = useState<Date>(() => initial?.refDate ?? new Date())
  const [customStart, setCustomStart] = useState(() => {
    if (initial?.customStart) return initial.customStart
    const now = new Date()
    return toISODate(new Date(now.getFullYear(), now.getMonth(), 1))
  })
  const [customEnd, setCustomEnd] = useState(() => initial?.customEnd ?? toISODate(new Date()))

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return
    try {
      localStorage.setItem(
        `track_date_filter_${storageKey}`,
        JSON.stringify({
          preset,
          refDate: refDate.toISOString(),
          customStart,
          customEnd,
        })
      )
    } catch {
      // Ignorar errores de cuota o localStorage bloqueado
    }
  }, [storageKey, preset, refDate, customStart, customEnd])

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

