import { Coins, Lock, PiggyBank, Unlock } from 'lucide-react'
import type { AhorrosKpis } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReporteAhorrosKpisProps = {
  kpis: AhorrosKpis
  loading?: boolean
}

export function ReporteAhorrosKpis({ kpis, loading }: ReporteAhorrosKpisProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-slate-200/60 bg-white/60 dark:border-slate-800/40 dark:bg-slate-900/40"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Total Ahorrado */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Ahorrado</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400">
            <PiggyBank className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-teal-600 dark:text-teal-400">
            {formatSoles(kpis.totalAhorrado)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Fondo total acumulado
          </span>
        </div>
      </div>

      {/* Ahorro Libre */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ahorro Libre</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <Unlock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatSoles(kpis.ahorroLibre)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Disponible para emergencias
          </span>
        </div>
      </div>

      {/* Ahorro Asignado */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Asignado a Metas</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <Lock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-indigo-600 dark:text-indigo-400">
            {formatSoles(kpis.ahorroAsignado)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Comprometido en objetivos
          </span>
        </div>
      </div>

      {/* Aportes Periodo */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Aportes del Período</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <Coins className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            {formatSoles(kpis.aportesPeriodo)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {kpis.movimientosPeriodoCount} {kpis.movimientosPeriodoCount === 1 ? 'movimiento' : 'movimientos'}
          </span>
        </div>
      </div>
    </div>
  )
}
