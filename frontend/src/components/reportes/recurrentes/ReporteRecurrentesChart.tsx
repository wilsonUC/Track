import { PieChart, Repeat } from 'lucide-react'
import type { RecurrenteReportItem } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReporteRecurrentesChartProps = {
  items: RecurrenteReportItem[]
  loading?: boolean
}

const RADIUS = 42
const STROKE = 16
const CENTER = 60
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const COLOR_PALETTE = ['#6366f1', '#ec4899', '#f59e0b', '#06b6d4', '#8b5cf6', '#10b981', '#3b82f6', '#f43f5e']

export function ReporteRecurrentesChart({ items, loading }: ReporteRecurrentesChartProps) {
  // Solo gastos fijos
  const expenseItems = items.filter((i) => i.tipo === 'expense')
  const totalExpense = expenseItems.reduce((sum, i) => sum + i.montoMes, 0)

  // Agrupar por categoría
  const categoryMap = new Map<string, number>()
  expenseItems.forEach((i) => {
    categoryMap.set(i.categoriaNombre, (categoryMap.get(i.categoriaNombre) || 0) + i.montoMes)
  })

  const segments = Array.from(categoryMap.entries()).map(([nombre, monto], idx) => ({
    nombre,
    monto,
    porcentaje: totalExpense > 0 ? (monto / totalExpense) * 100 : 0,
    colorHex: COLOR_PALETTE[idx % COLOR_PALETTE.length],
  }))

  let offset = 0

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Distribución por Categoría de Recurrentes (Donut) */}
      <article className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Distribución de Gastos Fijos</h2>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500">Cargando…</div>
        ) : segments.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/30">
            <p className="text-xs text-slate-400">Sin gastos recurrentes registrados</p>
          </div>
        ) : (
          <>
            <div className="my-2 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="h-36 w-36" aria-hidden>
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth={STROKE}
                  className="dark:stroke-slate-800"
                />
                {segments.map((segment) => {
                  const dash = (segment.porcentaje / 100) * CIRCUMFERENCE
                  const circle = (
                    <circle
                      key={segment.nombre}
                      cx={CENTER}
                      cy={CENTER}
                      r={RADIUS}
                      fill="none"
                      stroke={segment.colorHex}
                      strokeWidth={STROKE}
                      strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                      strokeDashoffset={-offset}
                      transform={`rotate(-90 ${CENTER} ${CENTER})`}
                      className="transition-all duration-300"
                    />
                  )
                  offset += dash
                  return circle
                })}
                <text
                  x={CENTER}
                  y={CENTER - 4}
                  textAnchor="middle"
                  className="fill-slate-700 text-[11px] font-extrabold dark:fill-slate-200"
                >
                  Fijos
                </text>
                <text
                  x={CENTER}
                  y={CENTER + 10}
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-medium dark:fill-slate-500"
                >
                  {segments.length} cat.
                </text>
              </svg>
            </div>

            <ul className="mt-2 space-y-2">
              {segments.map((seg) => (
                <li key={seg.nombre} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: seg.colorHex }}
                    />
                    <span className="truncate font-medium">{seg.nombre}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 dark:text-slate-500">{formatSoles(seg.monto)}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {seg.porcentaje.toFixed(1)}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </article>

      {/* Calendario de Vencimiento de Pagos (Bar / Matrix) */}
      <article className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-6 lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <Repeat className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Cronograma mensual de cortes y pagos
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Distribución de compromisos ordenados por día del mes
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-44 items-center justify-center text-sm text-slate-500">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/30">
            <p className="text-xs text-slate-400">Sin compromisos recurrentes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...items]
              .sort((a, b) => a.diaPago - b.diaPago)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-900/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-600 text-xs dark:bg-indigo-500/15 dark:text-indigo-300">
                      {item.diaPago}
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.nombre}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {item.categoriaNombre} · {item.tipo === 'income' ? 'Ingreso fijo' : 'Gasto recurrente'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {formatSoles(item.montoMes)}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        item.estadoPago === 'pagado'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : item.estadoPago === 'vencido'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                            : item.estadoPago === 'parcial'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.estadoPago}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </article>
    </div>
  )
}
