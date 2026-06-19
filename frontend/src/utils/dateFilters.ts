export type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'total' | 'custom'

export type DateRange = {
  start: string | null
  end: string | null
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getMondayOfWeek(ref: Date): Date {
  const d = startOfDay(ref)
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

export function getDateRangeForPreset(
  preset: DatePreset,
  refDate = new Date(),
  custom?: { start: string; end: string },
): DateRange {
  const today = startOfDay(refDate)

  switch (preset) {
    case 'today':
      return { start: toISODate(today), end: toISODate(today) }
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return { start: toISODate(yesterday), end: toISODate(yesterday) }
    }
    case 'week': {
      const monday = getMondayOfWeek(today)
      return { start: toISODate(monday), end: toISODate(today) }
    }
    case 'month': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1)
      return { start: toISODate(first), end: toISODate(today) }
    }
    case 'total':
      return { start: null, end: null }
    case 'custom':
      if (custom?.start && custom?.end) {
        const start = custom.start <= custom.end ? custom.start : custom.end
        const end = custom.start <= custom.end ? custom.end : custom.start
        return { start, end }
      }
      return { start: null, end: null }
  }
}

export function isDateInRange(fecha: string, range: DateRange): boolean {
  if (range.start === null && range.end === null) return true
  if (!range.start || !range.end) return true
  return fecha >= range.start && fecha <= range.end
}

const presetLabels: Record<Exclude<DatePreset, 'custom'>, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  week: 'Esta semana',
  month: 'Este mes',
  total: 'Total',
}

export function formatDateRangeLabel(preset: DatePreset, range: DateRange): string {
  if (preset !== 'custom') return presetLabels[preset]
  if (range.start && range.end) {
    if (range.start === range.end) return range.start
    return `${range.start} – ${range.end}`
  }
  return 'Período personalizado'
}

export const datePresetOptions: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Hoy' },
  { id: 'yesterday', label: 'Ayer' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'total', label: 'Total' },
  { id: 'custom', label: 'Período' },
]
