import { useMemo, useState } from 'react'
import { Calendar, Check, Clock, Sparkles, X, Zap } from 'lucide-react'

export type DurationUnit = 'm' | 'h' | 'd' | 'w' | 'meses'

type CustomDurationModalProps = {
  isOpen: boolean
  username: string
  currentDuracion?: string | number | null
  onClose: () => void
  onApply: (durationCode: string, summaryLabel: string) => void
}

const UNIT_LABELS: Record<DurationUnit, { singular: string; plural: string; suffix: string }> = {
  m: { singular: 'minuto', plural: 'minutos', suffix: 'm' },
  h: { singular: 'hora', plural: 'horas', suffix: 'h' },
  d: { singular: 'día', plural: 'días', suffix: 'd' },
  w: { singular: 'semana', plural: 'semanas', suffix: 'w' },
  meses: { singular: 'mes', plural: 'meses', suffix: 'meses' },
}

const PRESETS: Array<{ label: string; amount: number; unit: DurationUnit; icon?: 'zap' | 'clock' | 'calendar' }> = [
  { label: '15 min', amount: 15, unit: 'm', icon: 'zap' },
  { label: '30 min', amount: 30, unit: 'm', icon: 'zap' },
  { label: '1 hora', amount: 1, unit: 'h', icon: 'clock' },
  { label: '2 horas', amount: 2, unit: 'h', icon: 'clock' },
  { label: '12 horas', amount: 12, unit: 'h', icon: 'clock' },
  { label: '1 día', amount: 1, unit: 'd', icon: 'calendar' },
  { label: '3 días', amount: 3, unit: 'd', icon: 'calendar' },
  { label: '7 días', amount: 7, unit: 'd', icon: 'calendar' },
]

function parseInitialDuration(duracion?: string | number | null): { amount: number; unit: DurationUnit } {
  if (duracion) {
    const match = String(duracion).trim().toLowerCase().match(/^(\d+)\s*([a-z]+)$/)
    if (match) {
      const val = parseInt(match[1], 10)
      const u = match[2]
      if (val > 0) {
        let parsedUnit: DurationUnit = 'm'
        if (u === 'm' || u === 'min') parsedUnit = 'm'
        else if (u === 'h' || u === 'hr' || u === 'hrs') parsedUnit = 'h'
        else if (u === 'd') parsedUnit = 'd'
        else if (u === 'w' || u === 'sem') parsedUnit = 'w'
        else if (u === 'meses' || u === 'mes') parsedUnit = 'meses'
        return { amount: val, unit: parsedUnit }
      }
    }
  }
  return { amount: 30, unit: 'm' }
}

export function CustomDurationModal({
  isOpen,
  username,
  currentDuracion,
  onClose,
  onApply,
}: CustomDurationModalProps) {
  if (!isOpen) return null

  return (
    <CustomDurationModalDialog
      key={`${username}-${currentDuracion ?? 'none'}`}
      username={username}
      currentDuracion={currentDuracion}
      onClose={onClose}
      onApply={onApply}
    />
  )
}

function CustomDurationModalDialog({
  username,
  currentDuracion,
  onClose,
  onApply,
}: Omit<CustomDurationModalProps, 'isOpen'>) {
  const initial = parseInitialDuration(currentDuracion)
  const [amount, setAmount] = useState<number>(initial.amount)
  const [unit, setUnit] = useState<DurationUnit>(initial.unit)

  // Calculated expiration target datetime
  const expirationTarget = useMemo(() => {
    const now = new Date()
    const validAmount = Number.isFinite(amount) && amount > 0 ? amount : 1

    switch (unit) {
      case 'm':
        return new Date(now.getTime() + validAmount * 60 * 1000)
      case 'h':
        return new Date(now.getTime() + validAmount * 60 * 60 * 1000)
      case 'd':
        return new Date(now.getTime() + validAmount * 24 * 60 * 60 * 1000)
      case 'w':
        return new Date(now.getTime() + validAmount * 7 * 24 * 60 * 60 * 1000)
      case 'meses':
        return new Date(now.getTime() + validAmount * 30 * 24 * 60 * 60 * 1000)
    }
  }, [amount, unit])

  const formattedTargetDate = useMemo(() => {
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(expirationTarget)
  }, [expirationTarget])

  const summaryLabel = useMemo(() => {
    const validAmount = Number.isFinite(amount) && amount > 0 ? amount : 1
    const unitInfo = UNIT_LABELS[unit]
    const word = validAmount === 1 ? unitInfo.singular : unitInfo.plural
    return `${validAmount} ${word}`
  }, [amount, unit])

  const handleApply = () => {
    const validAmount = Math.max(1, Math.round(Number(amount) || 1))
    const code = `${validAmount}${unit}`
    onApply(code, summaryLabel)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-base">
                Vigencia personalizada
              </h3>
              <p className="text-xs text-slate-400">
                Acceso temporal para <span className="font-semibold text-slate-700 dark:text-slate-300">@{username}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="space-y-4 p-4 sm:p-5">
          {/* Accesos rápidos (Presets) */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Opciones rápidas
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => {
                const isActive = amount === preset.amount && unit === preset.unit
                return (
                  <button
                    key={`${preset.amount}-${preset.unit}`}
                    type="button"
                    onClick={() => {
                      setAmount(preset.amount)
                      setUnit(preset.unit)
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {preset.icon === 'zap' && <Zap className="h-3 w-3 text-amber-400" />}
                    {preset.icon === 'clock' && <Clock className="h-3 w-3" />}
                    {preset.icon === 'calendar' && <Calendar className="h-3 w-3" />}
                    <span>{preset.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Formulario: Cantidad y Unidad */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Definir tiempo exacto
            </label>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={amount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    setAmount(Number.isNaN(val) ? 1 : Math.max(1, val))
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-center text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="30"
                />
              </div>

              {/* Selector de Unidades */}
              <div className="col-span-7 flex rounded-xl border border-slate-200 bg-slate-50/70 p-1 dark:border-slate-700 dark:bg-slate-800">
                {(
                  [
                    { code: 'm', label: 'Min' },
                    { code: 'h', label: 'Hrs' },
                    { code: 'd', label: 'Días' },
                    { code: 'w', label: 'Sem' },
                    { code: 'meses', label: 'Mes' },
                  ] as const
                ).map((u) => {
                  const isSelected = unit === u.code
                  return (
                    <button
                      key={u.code}
                      type="button"
                      onClick={() => setUnit(u.code)}
                      className={`flex-1 rounded-lg py-1 text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {u.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Previsualización en Tiempo Real */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <div className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                  Caducará: <span className="font-bold underline decoration-indigo-400">{formattedTargetDate}</span>
                </p>
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                  Duración efectiva: <strong>{summaryLabel}</strong> a partir del momento en que se guarde.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs shadow-indigo-600/25 transition hover:bg-indigo-500"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Aplicar vigencia</span>
          </button>
        </div>
      </div>
    </div>
  )
}
