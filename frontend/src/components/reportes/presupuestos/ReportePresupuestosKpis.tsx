import { AlertTriangle, CheckCircle2, CreditCard, Flame, ShieldAlert, Wallet } from 'lucide-react'
import type { PresupuestosKpis } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReportePresupuestosKpisProps = {
  kpis: PresupuestosKpis
  loading?: boolean
}

export function ReportePresupuestosKpis({ kpis, loading }: ReportePresupuestosKpisProps) {
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

  const isOverBudget = kpis.excedidosCount > 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Límite Total */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Presupuestado</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            {formatSoles(kpis.limiteTotal)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {kpis.totalPresupuestos} {kpis.totalPresupuestos === 1 ? 'presupuesto activo' : 'presupuestos activos'}
          </span>
        </div>
      </div>

      {/* Gastado Total */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gasto Real</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-rose-600 dark:text-rose-400">
            {formatSoles(kpis.gastadoTotal)}
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Consumido en el mes
          </span>
        </div>
      </div>

      {/* % Ejecución Global */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">% Ejecución</span>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              kpis.porcentajeEjecucionGlobal > 100
                ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                : kpis.porcentajeEjecucionGlobal > 80
                  ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
            }`}
          >
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p
            className={`text-lg font-black tracking-tight ${
              kpis.porcentajeEjecucionGlobal > 100
                ? 'text-rose-600 dark:text-rose-400'
                : kpis.porcentajeEjecucionGlobal > 80
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {kpis.porcentajeEjecucionGlobal.toFixed(1)}%
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Restan {formatSoles(kpis.disponibleTotal)}
          </span>
        </div>
      </div>

      {/* Estado y Alertas */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Salud Presupuestal</span>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isOverBudget
                ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                : kpis.enAlertaCount > 0
                  ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
            }`}
          >
            {isOverBudget ? (
              <ShieldAlert className="h-4 w-4" />
            ) : kpis.enAlertaCount > 0 ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            {kpis.optimosCount} / {kpis.totalPresupuestos} OK
          </p>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {kpis.excedidosCount > 0
              ? `${kpis.excedidosCount} excedido(s)`
              : kpis.enAlertaCount > 0
                ? `${kpis.enAlertaCount} en alerta (>80%)`
                : 'Todos bajo control'}
          </span>
        </div>
      </div>
    </div>
  )
}
