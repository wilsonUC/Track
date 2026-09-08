import { Award, CheckCircle2, Target, TrendingUp } from 'lucide-react'
import type { MetasKpis } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReporteMetasKpisProps = {
  kpis: MetasKpis
  loading?: boolean
}

export function ReporteMetasKpis({ kpis, loading }: ReporteMetasKpisProps) {
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
      {/* Capital Objetivo */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Objetivo</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <Target className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            {formatSoles(kpis.capitalObjetivoTotal)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {kpis.totalMetas} {kpis.totalMetas === 1 ? 'meta definida' : 'metas definidas'}
          </span>
        </div>
      </div>

      {/* Capital Acumulado */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Acumulado Real</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatSoles(kpis.capitalAcumuladoTotal)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Fondos asignados
          </span>
        </div>
      </div>

      {/* % Progreso Global */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">% Avance Global</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-teal-600 dark:text-teal-400">
            {kpis.porcentajeProgresoGlobal.toFixed(1)}%
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Falta {formatSoles(kpis.capitalFaltanteTotal)}
          </span>
        </div>
      </div>

      {/* Estado de Metas */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estado</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            {kpis.completadasCount} / {kpis.totalMetas} completadas
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {kpis.enProgresoCount} en curso · {kpis.programadasCount} programadas
          </span>
        </div>
      </div>
    </div>
  )
}
