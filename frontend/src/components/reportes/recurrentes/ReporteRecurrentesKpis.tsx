import { CalendarCheck, DollarSign, Flame, Scale } from 'lucide-react'
import type { RecurrentesKpis } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReporteRecurrentesKpisProps = {
  kpis: RecurrentesKpis
  loading?: boolean
}

export function ReporteRecurrentesKpis({ kpis, loading }: ReporteRecurrentesKpisProps) {
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

  const isPositiveBalance = kpis.balanceFijoNeto >= 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Gastos Fijos / Mes */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gastos Fijos / Mes</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-rose-600 dark:text-rose-400">
            {formatSoles(kpis.gastosFijosMes)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Compromiso mensual
          </span>
        </div>
      </div>

      {/* Ingresos Fijos / Mes */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ingresos Fijos / Mes</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatSoles(kpis.ingresosFijosMes)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Sueldos y fijos
          </span>
        </div>
      </div>

      {/* Balance Fijo Neto */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Margen Fijo Libre</span>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isPositiveBalance
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
              isPositiveBalance
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isPositiveBalance ? '+' : ''}
            {formatSoles(kpis.balanceFijoNeto)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {isPositiveBalance ? 'Remanente antes de variables' : 'Déficit recurrente'}
          </span>
        </div>
      </div>

      {/* Cumplimiento del mes */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estado del Mes</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <CalendarCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            {kpis.pagadosTotalCount} / {kpis.totalRecurrentes} al día
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {kpis.vencidosCount > 0
              ? `${kpis.vencidosCount} vencido(s)`
              : kpis.pendientesCount > 0
                ? `${kpis.pendientesCount} pendiente(s)`
                : 'Todos registrados'}
          </span>
        </div>
      </div>
    </div>
  )
}
