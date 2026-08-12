import { ArrowDownLeft, ArrowUpRight, CalendarCheck, CheckCircle2, RefreshCw } from 'lucide-react'
import { formatSoles } from '../../utils/financeFormat'

type RecurrentesSummaryCardProps = {
  totalPendienteGastos: number
  totalGastosMes: number
  totalPendienteIngresos: number
  totalIngresosMes: number
}

export function RecurrentesSummaryCard({
  totalPendienteGastos,
  totalGastosMes,
  totalPendienteIngresos,
  totalIngresosMes,
}: RecurrentesSummaryCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-sm transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-slate-950/40 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* 1. Gastos Fijos Por Pagar (Pendiente actual) */}
        <div className="relative overflow-hidden rounded-xl border border-rose-100 bg-rose-50/40 p-4 transition-colors dark:border-rose-950/50 dark:bg-rose-950/25">
          <div className="flex items-center justify-between gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              Gastos por pagar
            </span>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 sm:text-3xl">
            {formatSoles(totalPendienteGastos)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Obligaciones de gasto aún no registradas este mes.
          </p>
        </div>

        {/* 2. Gastos Antes de Pagar Este Mes (Total mensual previsto) */}
        <div className="relative overflow-hidden rounded-xl border border-rose-200/60 bg-rose-50/20 p-4 transition-colors dark:border-rose-900/30 dark:bg-rose-950/10">
          <div className="flex items-center justify-between gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
              <CalendarCheck className="h-3.5 w-3.5 text-rose-500" aria-hidden />
              Gastos antes de pagar este mes
            </span>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-rose-600/85 dark:text-rose-300/85 sm:text-3xl">
            {formatSoles(totalGastosMes)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Monto total de gastos fijos programados del mes.
          </p>
        </div>

        {/* 3. Ingresos Fijos Por Cobrar (Pendiente actual) */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 transition-colors dark:border-emerald-950/50 dark:bg-emerald-950/25">
          <div className="flex items-center justify-between gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <ArrowDownLeft className="h-3.5 w-3.5" aria-hidden />
              Ingresos por cobrar
            </span>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-3xl">
            {formatSoles(totalPendienteIngresos)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ingresos recurrentes que aún no marcaste como cobrados.
          </p>
        </div>

        {/* 4. Ingresos Antes de Cobrar Este Mes (Total mensual previsto) */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/60 bg-emerald-50/20 p-4 transition-colors dark:border-emerald-900/30 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
              Ingresos antes de cobrar este mes
            </span>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-emerald-600/85 dark:text-emerald-300/85 sm:text-3xl">
            {formatSoles(totalIngresosMes)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Monto total de ingresos fijos proyectados del mes.
          </p>
        </div>
      </div>

      {/* Banner de información de reinicio mensual */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-indigo-100/80 bg-indigo-50/50 p-3.5 text-xs text-indigo-950 transition-colors dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200">
        <div className="mt-0.5 rounded-lg bg-indigo-100 p-1 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
          <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
        </div>
        <p className="leading-relaxed">
          El estado de cada recurrente se <span className="font-semibold underline decoration-indigo-300 underline-offset-2 dark:decoration-indigo-700">reinicia automáticamente</span> al cambiar de mes: si no hay transacción registrada, vuelve a estado <span className="font-semibold">pendiente</span>.
        </p>
      </div>
    </article>
  )
}
