export function formatApiError(raw: string, fallback: string): string {
  try {
    const data = JSON.parse(raw) as Record<string, string[] | string>
    const parts: string[] = []
    for (const value of Object.values(data)) {
      if (Array.isArray(value)) {
        parts.push(value.join(' '))
      } else if (typeof value === 'string') {
        parts.push(value)
      }
    }
    if (parts.length > 0) return parts.join(' · ')
  } catch {
    /* texto plano */
  }
  return fallback
}
