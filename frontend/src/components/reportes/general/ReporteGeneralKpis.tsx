import { ArrowDownRight, ArrowUpRight, Percent, Scale } from 'lucide-react'
import type { GeneralKpis } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReporteGeneralKpisProps = {
  kpis: GeneralKpis
  loading?: boolean
}

export function ReporteGeneralKpis({ kpis, loading }: ReporteGeneralKpisProps) {
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

  const isNetPositive = kpis.balanceNeto >= 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Total Ingresos */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Ingresos</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            {formatSoles(kpis.totalIngresos)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            En el período seleccionado
          </span>
        </div>
      </div>

      {/* Total Gastos */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Gastos</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
            <ArrowDownRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            {formatSoles(kpis.totalGastos)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Gastos acumulados
          </span>
        </div>
      </div>

      {/* Balance Neto */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Balance Neto</span>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isNetPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
            }`}
          >
            <Scale className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p
            className={`text-lg font-black tracking-tight ${
              isNetPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isNetPositive ? '+' : ''}
            {formatSoles(kpis.balanceNeto)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {isNetPositive ? 'Superávit del período' : 'Déficit del período'}
          </span>
        </div>
      </div>

      {/* Tasa de Ahorro */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tasa de Ahorro</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <Percent className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-indigo-600 dark:text-indigo-400">
            {kpis.tasaAhorroPercent.toFixed(1)}%
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Retención de ingresos
          </span>
        </div>
      </div>
    </div>
  )
}
