import { AlertTriangle, CheckCircle2, MinusCircle, Pencil, Plus } from 'lucide-react'
import { getCategoryChartColors, getCategoryDisplay } from '../../utils/categoryDisplay'
import type { MetaCardView } from '../../utils/metasDisplay'

type MetaCardProps = {
  meta: MetaCardView
  onAsignar: (meta: MetaCardView) => void
  onDesasignar: (meta: MetaCardView) => void
  onEditar: (meta: MetaCardView) => void
}

export function MetaCard({ meta, onAsignar, onDesasignar, onEditar }: MetaCardProps) {
  const {
    nombre,
    objetivo,
    acumulado,
    porcentaje,
    completada,
    estado,
    fechaLimiteLabel,
    iconCategory,
  } = meta

  const catInfo = getCategoryDisplay(iconCategory)
  const chartColors = getCategoryChartColors(iconCategory)
  const vencida = estado === 'vencida' && !completada

  return (
    <article className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-black tracking-wider text-slate-500">
            {iconCategory.toUpperCase()}
          </span>
          {fechaLimiteLabel && (
            <span className="text-xs font-medium text-slate-400">Meta: {fechaLimiteLabel}</span>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2.5 ${catInfo.bg}`}>{catInfo.icon}</div>
          <div>
            <h3 className="text-sm font-bold leading-tight text-slate-800">{nombre}</h3>
            <span className="text-[11px] text-slate-400">Progreso actual</span>
          </div>
        </div>

        {vencida && (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-600">
            <AlertTriangle className="h-3 w-3" aria-hidden />
            VENCIDA
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-black text-slate-900">
            S/ {acumulado}
            <span className="text-xs font-bold text-slate-400"> / S/ {objetivo}</span>
          </span>
          <span
            className={`text-xs font-bold ${completada ? 'text-emerald-500' : 'text-slate-600'}`}
          >
            {porcentaje}%
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              completada ? 'bg-emerald-500' : chartColors.colorBg
            }`}
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          />
        </div>
      </div>

      {completada && (
        <div className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 py-2 text-xs font-bold text-emerald-600">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          ¡Meta lograda con éxito!
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={completada}
          onClick={() => onAsignar(meta)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Asignar</span>
        </button>
        <button
          type="button"
          disabled={acumulado <= 0}
          onClick={() => onDesasignar(meta)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MinusCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Quitar</span>
        </button>
        <button
          type="button"
          onClick={() => onEditar(meta)}
          className="flex shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
          aria-label={`Editar meta ${nombre}`}
          title="Editar meta"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </article>
  )
}
