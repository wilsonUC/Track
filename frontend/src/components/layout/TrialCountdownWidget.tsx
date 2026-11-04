import { useEffect, useState } from 'react'
import { Clock, ExternalLink, Sparkles } from 'lucide-react'

type TrialCountdownWidgetProps = {
  fechaExpiracion?: string | null
  variant?: 'sidebar' | 'mobile'
}

const WHATSAPP_PHONE = '51991880390'
const WHATSAPP_MESSAGE =
  'Hola, tengo mi cuenta de prueba en FinanzasTrack y deseo solicitar acceso completo.'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export function TrialCountdownWidget({
  fechaExpiracion,
  variant = 'sidebar',
}: TrialCountdownWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
    diff: number
  } | null>(null)

  useEffect(() => {
    if (!fechaExpiracion) return

    const expTime = new Date(fechaExpiracion).getTime()
    if (isNaN(expTime)) return

    const calculateTime = () => {
      const now = Date.now()
      const diff = expTime - now
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, diff: 0 })
        return
      }
      const totalSeconds = Math.floor(diff / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      setTimeLeft({ hours, minutes, seconds, diff })
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [fechaExpiracion])

  if (!fechaExpiracion || !timeLeft || timeLeft.diff <= 0) {
    return null
  }

  const { hours, minutes, seconds, diff } = timeLeft
  const hoursStr = String(hours).padStart(2, '0')
  const minutesStr = String(minutes).padStart(2, '0')
  const secondsStr = String(seconds).padStart(2, '0')

  // % de progreso de 48h (172,800 segundos)
  const maxMs = 48 * 60 * 60 * 1000
  const progressPercent = Math.max(3, Math.min(100, (diff / maxMs) * 100))

  if (variant === 'mobile') {
    return (
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-indigo-100/70 p-2.5 px-3.5 shadow-xs backdrop-blur-md dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/60 md:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
            <Clock className="h-4 w-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Prueba de 48h
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Restante
              </span>
            </div>
            <div className="font-mono text-xs font-black tracking-tight text-slate-900 dark:text-slate-100">
              {hoursStr}h {minutesStr}m {secondsStr}s
            </div>
          </div>
        </div>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-95"
          title="Contactar por WhatsApp para solicitar acceso completo"
        >
          <span>Solicitar acceso</span>
          <ExternalLink className="h-3 w-3 opacity-80" />
        </a>
      </div>
    )
  }

  // Versión Sidebar (Desktop)
  return (
    <div className="mb-2 shrink-0 rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-800/80 via-indigo-900/90 to-purple-950/80 p-3.5 text-white shadow-lg shadow-indigo-950/25 backdrop-blur-md dark:border-slate-800 dark:from-slate-900/90 dark:to-slate-950/90">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-xs font-bold tracking-tight text-indigo-100">Prueba Gratuita</span>
        </div>
        <span className="rounded-full border border-amber-300/30 bg-amber-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
          48 Horas
        </span>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium text-indigo-200 dark:text-slate-400">
          Restante:
        </span>
        <span className="font-mono text-sm font-black tracking-tight text-white drop-shadow-xs">
          {hoursStr}h {minutesStr}m {secondsStr}s
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-indigo-950/80 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-center text-xs font-bold text-white shadow-md shadow-emerald-950/20 transition-all hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg active:scale-95"
        title="Contactar por WhatsApp para solicitar acceso completo"
      >
        <span>Solicitar acceso completo</span>
        <ExternalLink className="h-3.5 w-3.5 opacity-90" />
      </a>
    </div>
  )
}

