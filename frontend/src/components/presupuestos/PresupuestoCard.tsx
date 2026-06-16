import { AlertTriangle, Pencil, Plus } from 'lucide-react'
import { getCategoryDisplay, getCategoryChartColors } from '../../utils/categoryDisplay'
import type { PresupuestoCardView } from './presupuestosTypes'

type PresupuestoCardProps = {
  presupuesto: PresupuestoCardView
  onRegistrarGasto: (id: number) => void
  onEditar: (presupuesto: PresupuestoCardView) => void
  registrando?: boolean
}

export function PresupuestoCard({
  presupuesto,
  onRegistrarGasto,
  onEditar,
  registrando,
}: PresupuestoCardProps) {
  const { id, nombre, limite, gastado, montoRapido, porcentaje, estado, iconCategory } = presupuesto
  const catInfo = getCategoryDisplay(iconCategory)
  const chartColors = getCategoryChartColors(iconCategory)
  const excedido = estado === 'excedido'
  const alLimite = estado === 'alerta'

  return (
    <article className="flex flex-col justify-between space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${catInfo.bg}`}>{catInfo.icon}</div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">{nombre}</h3>
            <span className="text-[11px] text-slate-400">Límite mensual</span>
          </div>
        </div>

        {excedido && (
          <span className="flex animate-pulse items-center gap-1 rounded-md border border-rose-100 bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-600">
            <AlertTriangle className="h-3 w-3" aria-hidden />
            EXCEDIDO
          </span>
        )}
        {alLimite && (
          <span className="flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-600">
            <AlertTriangle className="h-3 w-3" aria-hidden />
            AJUSTADO
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-black text-slate-900">
            S/ {gastado}
            <span className="text-xs font-bold text-slate-400"> / S/ {limite}</span>
          </span>
          <span
            className={`text-xs font-black ${
              excedido ? 'text-rose-500' : alLimite ? 'text-amber-500' : 'text-slate-500'
            }`}
          >
            {porcentaje}%
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              excedido ? 'bg-rose-500' : alLimite ? 'bg-amber-500' : chartColors.colorBg
            }`}
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={registrando}
          onClick={() => onRegistrarGasto(id)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-60 ${
            excedido
              ? 'border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{registrando ? 'Registrando…' : `Registrar gasto (S/ ${montoRapido})`}</span>
        </button>

        <button
          type="button"
          onClick={() => onEditar(presupuesto)}
          className={`flex shrink-0 items-center justify-center rounded-xl border px-3 py-2.5 transition-all active:scale-95 ${
            excedido
              ? 'border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
          aria-label={`Editar presupuesto ${nombre}`}
          title="Editar presupuesto"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </article>
  )
}
