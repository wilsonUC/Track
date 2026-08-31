import { ArrowDownLeft, ArrowUpRight, RefreshCw, X } from 'lucide-react'
import { formatSoles } from '../../utils/financeFormat'
import { useDismissibleBanner } from '../../hooks/useDismissibleBanner'

type RecurrentesSummaryCardProps = {
  totalPendienteGastos: number
  totalPagadoGastos: number
  totalGastosMes: number
  totalPendienteIngresos: number
  totalCobradoIngresos: number
  totalIngresosMes: number
}

export function RecurrentesSummaryCard({
  totalPendienteGastos,
  totalPagadoGastos,
  totalGastosMes,
  totalPendienteIngresos,
  totalCobradoIngresos,
  totalIngresosMes,
}: RecurrentesSummaryCardProps) {
  const { isVisible: showMonthlyResetNotice, dismiss: dismissMonthlyResetNotice } =
    useDismissibleBanner('recurrentes_monthly_reset', 7)

  const porcentajeGastos = totalGastosMes > 0 ? Math.round((totalPagadoGastos / totalGastosMes) * 100) : 0
  const porcentajeIngresos = totalIngresosMes > 0 ? Math.round((totalCobradoIngresos / totalIngresosMes) * 100) : 0

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-sm transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-slate-950/40 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {/* 1. Gastos Fijos Por Pagar */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-rose-100 bg-rose-50/40 p-4 sm:p-5 transition-colors dark:border-rose-950/50 dark:bg-rose-950/25">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                Gastos por pagar
              </span>
            </div>
            <div className="mt-3 text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 sm:text-4xl">
              {formatSoles(totalPendienteGastos)}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Obligaciones de gasto pendientes este mes
            </p>
          </div>

          {/* Desglose Pagado / Total con Progreso */}
          <div className="mt-4 rounded-xl border border-rose-200/60 bg-white/80 p-3 shadow-2xs backdrop-blur-xs dark:border-rose-900/40 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400 dark:text-slate-500">Pagado:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{formatSoles(totalPagadoGastos)}</span>
                <span className="text-slate-400 dark:text-slate-500">/</span>
                <span className="text-slate-700 dark:text-slate-300">{formatSoles(totalGastosMes)}</span>
              </span>
              <span className="rounded-md bg-rose-100/90 px-1.5 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300 shrink-0">
                {porcentajeGastos}%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-rose-100/80 dark:bg-rose-950/80">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500 dark:bg-rose-400"
                style={{ width: `${Math.min(100, Math.max(0, porcentajeGastos))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Ingresos Fijos Por Cobrar */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5 transition-colors dark:border-emerald-950/50 dark:bg-emerald-950/25">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <ArrowDownLeft className="h-3.5 w-3.5" aria-hidden />
                Ingresos por cobrar
              </span>
            </div>
            <div className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-4xl">
              {formatSoles(totalPendienteIngresos)}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Ingresos recurrentes por cobrar este mes
            </p>
          </div>

          {/* Desglose Cobrado / Total con Progreso */}
          <div className="mt-4 rounded-xl border border-emerald-200/60 bg-white/80 p-3 shadow-2xs backdrop-blur-xs dark:border-emerald-900/40 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400 dark:text-slate-500">Cobrado:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatSoles(totalCobradoIngresos)}</span>
                <span className="text-slate-400 dark:text-slate-500">/</span>
                <span className="text-slate-700 dark:text-slate-300">{formatSoles(totalIngresosMes)}</span>
              </span>
              <span className="rounded-md bg-emerald-100/90 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                {porcentajeIngresos}%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100/80 dark:bg-emerald-950/80">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 dark:bg-emerald-400"
                style={{ width: `${Math.min(100, Math.max(0, porcentajeIngresos))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Banner de información de reinicio mensual */}
      {showMonthlyResetNotice && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-indigo-100/80 bg-indigo-50/50 p-3 text-xs text-indigo-950 transition-all duration-300 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="mt-0.5 rounded-lg bg-indigo-100 p-1 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 shrink-0">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            </div>
            <p className="leading-relaxed">
              El estado de cada recurrente se <span className="font-semibold underline decoration-indigo-300 underline-offset-2 dark:decoration-indigo-700">reinicia automáticamente</span> al cambiar de mes: si no hay transacción registrada, vuelve a estado <span className="font-semibold">pendiente</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissMonthlyResetNotice}
            className="shrink-0 rounded-lg p-1 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700 transition-colors dark:text-indigo-400 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-200"
            title="Ocultar aviso por 7 días"
            aria-label="Ocultar aviso por 7 días"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </article>
  )
}
