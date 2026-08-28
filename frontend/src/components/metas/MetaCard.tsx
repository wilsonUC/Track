import { AlertTriangle, Calendar, CheckCircle2, MinusCircle, Pencil, Plus, Trash2, Zap, PiggyBank } from 'lucide-react'
import { getCategoryChartColors, getCategoryDisplay } from '../../utils/categoryDisplay'
import type { MetaCardView } from '../../utils/metasDisplay'

type MetaCardProps = {
  meta: MetaCardView
  onAsignar: (meta: MetaCardView) => void
  onDesasignar: (meta: MetaCardView) => void
  onEditar: (meta: MetaCardView) => void
  onEliminar: (id: number) => void
  onCambiarModo?: (meta: MetaCardView) => void
}

export function MetaCard({ meta, onAsignar, onDesasignar, onEditar, onEliminar, onCambiarModo }: MetaCardProps) {
  const {
    nombre,
    objetivo,
    acumulado,
    porcentaje,
    completada,
    estado,
    esAsignacionLibre,
    fechaInicioLabel,
    fechaLimiteLabel,
    iconCategory,
    montoSugeridoMensual,
  } = meta

  const catInfo = getCategoryDisplay(iconCategory)
  const chartColors = getCategoryChartColors(iconCategory)
  const vencida = estado === 'vencida' && !completada

  return (
    <article className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:shadow-slate-950/40">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-black tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {iconCategory.toUpperCase()}
            </span>

            {/* Badge de tipo de asignación */}
            {onCambiarModo ? (
              <button
                type="button"
                onClick={() => onCambiarModo(meta)}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer hover:opacity-80 active:scale-95 ${
                  esAsignacionLibre
                    ? 'border border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300'
                }`}
                title="Haz clic para cambiar el modo de asignación de esta meta"
              >
                {esAsignacionLibre ? (
                  <>
                    <Zap className="h-3 w-3 text-indigo-500" />
                    <span>Libre</span>
                  </>
                ) : (
                  <>
                    <PiggyBank className="h-3 w-3 text-emerald-500" />
                    <span>Ahorro</span>
                  </>
                )}
              </button>
            ) : (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  esAsignacionLibre
                    ? 'border border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300'
                }`}
              >
                {esAsignacionLibre ? 'Libre' : 'Ahorro'}
              </span>
            )}
          </div>

          {(fechaInicioLabel || fechaLimiteLabel) && (
            <span className="flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
              <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
              <span>
                {fechaInicioLabel && fechaLimiteLabel
                  ? `${fechaInicioLabel} al ${fechaLimiteLabel}`
                  : fechaInicioLabel
                    ? `Inicio: ${fechaInicioLabel}`
                    : `Meta: ${fechaLimiteLabel}`}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2.5 ${catInfo.bg}`}>{catInfo.icon}</div>
          <div>
            <h3 className="text-sm font-bold leading-tight text-slate-800 dark:text-slate-200">{nombre}</h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-400">Progreso actual</span>
          </div>
        </div>

        {vencida && (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" aria-hidden />
            VENCIDA
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-black text-slate-900 dark:text-slate-100">
            S/ {acumulado.toFixed(2)}
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400"> / S/ {objetivo.toFixed(2)}</span>
          </span>
          <span
            className={`text-xs font-bold ${completada ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'}`}
          >
            {porcentaje}%
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              completada ? 'bg-emerald-500' : chartColors.colorBg
            }`}
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          />
        </div>

        {!completada && montoSugeridoMensual && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/60 dark:border-indigo-900/40 rounded-xl p-2 mt-1">
            💡 Ahorro mensual sugerido: <span className="font-bold text-indigo-700 dark:text-indigo-300">S/ {montoSugeridoMensual.toFixed(2)}</span>
          </p>
        )}
      </div>

      {completada && (
        <div className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 py-2 text-xs font-bold text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          ¡Meta lograda con éxito!
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={completada}
          onClick={() => onAsignar(meta)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-indigo-950/50"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Asignar</span>
        </button>
        <button
          type="button"
          disabled={acumulado <= 0}
          onClick={() => onDesasignar(meta)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-rose-950/50"
        >
          <MinusCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Quitar</span>
        </button>
        <button
          type="button"
          onClick={() => onEditar(meta)}
          className="flex shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-indigo-950/50"
          aria-label={`Editar meta ${nombre}`}
          title="Editar meta"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onEliminar(meta.id)}
          className="flex shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-rose-950/50"
          aria-label={`Eliminar meta ${nombre}`}
          title="Eliminar meta"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </article>
  )
}
