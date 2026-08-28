import { useState } from 'react'
import { AlertTriangle, Pencil, Plus, Lock, Clock } from 'lucide-react'
import { getCategoryDisplay, getCategoryChartColors } from '../../utils/categoryDisplay'
import type { PresupuestoCardView } from './presupuestosTypes'

type PresupuestoCardProps = {
  presupuesto: PresupuestoCardView
  onRegistrarGasto: (id: number) => void
  onEditar: (presupuesto: PresupuestoCardView) => void
  registrando?: boolean
  esMesActual?: boolean
  esMesPasado?: boolean
  esMesFuturo?: boolean
}

export function PresupuestoCard({
  presupuesto,
  onRegistrarGasto,
  onEditar,
  registrando,
  esMesActual = true,
  esMesPasado = false,
  esMesFuturo = false,
}: PresupuestoCardProps) {
  const { id, nombre, limite, gastado, montoRapido, porcentaje, estado, iconCategory, consumos } = presupuesto
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const catInfo = getCategoryDisplay(iconCategory)
  const chartColors = getCategoryChartColors(iconCategory)
  const excedido = estado === 'excedido'
  const alLimite = estado === 'alerta'

  return (
    <article className="flex flex-col justify-between space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:shadow-slate-950/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${catInfo.bg}`}>{catInfo.icon}</div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200">{nombre}</h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-400">Límite mensual</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {esMesPasado && (
            <span className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              <Lock className="h-3 w-3" />
              CERRADO
            </span>
          )}
          {esMesFuturo && (
            <span className="flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Clock className="h-3 w-3" />
              PRÓXIMO
            </span>
          )}
          {excedido && (
            <span className="flex animate-pulse items-center gap-1 rounded-md border border-rose-100 bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertTriangle className="h-3 w-3" aria-hidden />
              EXCEDIDO
            </span>
          )}
          {alLimite && (
            <span className="flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" aria-hidden />
              AJUSTADO
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">
            S/ {gastado.toFixed(2)}
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400"> / S/ {limite.toFixed(2)}</span>
          </span>
          <span
            className={`text-xs font-black ${
              excedido ? 'text-rose-500' : alLimite ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {porcentaje}%
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              excedido ? 'bg-rose-500' : alLimite ? 'bg-amber-500' : chartColors.colorBg
            }`}
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          />
        </div>
      </div>

      {/* Historial de consumos (Solo lectura) */}
      {consumos && consumos.length > 0 && (
        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 dark:border-slate-800">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Historial de consumos
            </span>
            <button
              type="button"
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className="cursor-pointer text-[9px] font-bold uppercase tracking-wide text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {mostrarHistorial ? 'Ocultar' : `Ver (${consumos.length})`}
            </button>
          </div>

          {mostrarHistorial && (
            <ul className="max-h-[120px] divide-y divide-slate-100/60 overflow-y-auto pr-1 dark:divide-slate-800/60">
              {consumos.map((consumo) => (
                <li key={consumo.id} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    S/ {Number(consumo.monto).toFixed(2)}
                  </span>
                  <span className="font-medium text-slate-400 dark:text-slate-400 text-[11px]">
                    {consumo.fecha.slice(8, 10)}/{consumo.fecha.slice(5, 7)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2">
        {esMesActual ? (
          <button
            type="button"
            disabled={registrando}
            onClick={() => onRegistrarGasto(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-60 ${
              excedido
                ? 'border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400'
                : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-indigo-950/50'
            }`}
          >
            <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{registrando ? 'Registrando…' : `Registrar gasto (S/ ${montoRapido})`}</span>
          </button>
        ) : (
          <div
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50/70 py-2.5 text-xs font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400 select-none cursor-not-allowed"
            title={esMesPasado ? 'Período cerrado (solo lectura)' : 'Próximo período (no iniciado)'}
          >
            <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            <span>{esMesPasado ? 'Mes cerrado' : 'Próximo mes'}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onEditar(presupuesto)}
          className={`flex shrink-0 items-center justify-center rounded-xl border px-3 py-2.5 transition-all active:scale-95 ${
            excedido
              ? 'border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400'
              : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-indigo-950/50'
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
