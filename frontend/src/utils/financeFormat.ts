const monthNames = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const monthShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const chartMonthShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function parseTransactionDate(fecha: string): Date {
  const [year, month, day] = fecha.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatSoles(
  value: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
) {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options ?? {}
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits, maximumFractionDigits })}`
}

export function formatSignedSoles(value: number, isIncome: boolean) {
  const formatted = formatSoles(Math.abs(value))
  if (value === 0) return formatted
  return isIncome ? `+${formatted}` : `-${formatted}`
}

export function formatMonthYear(date: Date) {
  const name = monthNames[date.getMonth()]
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${date.getFullYear()}`
}

export function formatShortDate(fecha: string) {
  const date = parseTransactionDate(fecha)
  const day = date.getDate()
  const month = monthShort[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month}. ${year}`
}

export function formatChartMonth(date: Date) {
  return chartMonthShort[date.getMonth()]
}

export function isSameMonth(fecha: string, reference: Date) {
  const date = parseTransactionDate(fecha)
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth()
}
