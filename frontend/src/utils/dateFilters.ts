export type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'total' | 'custom'

export type DateRange = {
  start: string | null
  end: string | null
}

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const MESES_ABR = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Oct',
  'Nov',
  'Dic',
]

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
  const target = startOfDay(refDate)

  switch (preset) {
    case 'today':
      return { start: toISODate(target), end: toISODate(target) }
    case 'yesterday': {
      const yesterday = new Date(target)
      yesterday.setDate(yesterday.getDate() - 1)
      return { start: toISODate(yesterday), end: toISODate(yesterday) }
    }
    case 'week': {
      const monday = getMondayOfWeek(target)
      const sunday = new Date(monday)
      sunday.setDate(sunday.getDate() + 6)
      return { start: toISODate(monday), end: toISODate(sunday) }
    }
    case 'month': {
      const first = new Date(target.getFullYear(), target.getMonth(), 1)
      const last = new Date(target.getFullYear(), target.getMonth() + 1, 0)
      return { start: toISODate(first), end: toISODate(last) }
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

export function formatPeriodStepperLabel(preset: DatePreset, refDate = new Date()): string {
  const target = startOfDay(refDate)
  if (preset === 'month' || preset === 'total' || preset === 'custom') {
    return `${MESES[target.getMonth()]} ${target.getFullYear()}`
  }
  if (preset === 'week') {
    const monday = getMondayOfWeek(target)
    const sunday = new Date(monday)
    sunday.setDate(sunday.getDate() + 6)
    if (monday.getMonth() === sunday.getMonth()) {
      return `${monday.getDate()} – ${sunday.getDate()} ${MESES_ABR[monday.getMonth()]}`
    }
    return `${monday.getDate()} ${MESES_ABR[monday.getMonth()]} – ${sunday.getDate()} ${MESES_ABR[sunday.getMonth()]}`
  }
  if (preset === 'today') {
    return `${target.getDate()} ${MESES_ABR[target.getMonth()]} ${target.getFullYear()}`
  }
  if (preset === 'yesterday') {
    const yest = new Date(target)
    yest.setDate(yest.getDate() - 1)
    return `${yest.getDate()} ${MESES_ABR[yest.getMonth()]} ${yest.getFullYear()}`
  }
  return `${MESES[target.getMonth()]} ${target.getFullYear()}`
}

export function formatDateRangeLabel(preset: DatePreset, range: DateRange, refDate = new Date()): string {
  const target = startOfDay(refDate)
  const now = new Date()

  if (preset === 'month') {
    if (target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear()) {
      return 'Este mes'
    }
    return `${MESES[target.getMonth()]} ${target.getFullYear()}`
  }
  if (preset === 'week') {
    const m1 = getMondayOfWeek(target).getTime()
    const m2 = getMondayOfWeek(now).getTime()
    if (Math.abs(m1 - m2) < 24 * 60 * 60 * 1000) {
      return 'Esta semana'
    }
    const monday = getMondayOfWeek(target)
    const sunday = new Date(monday)
    sunday.setDate(sunday.getDate() + 6)
    return `${monday.getDate()} ${MESES_ABR[monday.getMonth()]} – ${sunday.getDate()} ${MESES_ABR[sunday.getMonth()]}`
  }
  if (preset === 'today') {
    if (toISODate(target) === toISODate(now)) return 'Hoy'
    return `${target.getDate()} ${MESES_ABR[target.getMonth()]} ${target.getFullYear()}`
  }
  if (preset === 'yesterday') {
    return 'Ayer'
  }
  if (preset === 'total') {
    return 'Total'
  }
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

