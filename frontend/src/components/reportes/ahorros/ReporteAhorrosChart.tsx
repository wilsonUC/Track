import { PieChart, TrendingUp } from 'lucide-react'
import type { AhorrosCompositionSegment, AhorrosMonthlyPoint } from '../reportesTypes'
import { formatSoles } from '../../../utils/financeFormat'

type ReporteAhorrosChartProps = {
  composition: AhorrosCompositionSegment[]
  monthlyPoints: AhorrosMonthlyPoint[]
  loading?: boolean
}

const RADIUS = 42
const STROKE = 16
const CENTER = 60
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ReporteAhorrosChart({
  composition,
  monthlyPoints,
  loading,
}: ReporteAhorrosChartProps) {
  let offset = 0
  const maxMonthly = Math.max(...monthlyPoints.map((p) => p.aportes), 1)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 1. Evolución de Aportes Mensuales (Bar Chart) */}
      <article className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-6 lg:col-span-2">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden />
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Evolución mensual de ahorros
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Aportes guardados en los últimos 6 meses
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-500">Cargando…</div>
        ) : monthlyPoints.every((p) => p.aportes === 0) ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 p-6 text-center dark:border-slate-800/80 dark:bg-slate-900/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <TrendingUp className="h-5 w-5" aria-hidden />
            </div>
            <p className="max-w-xs text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              Sin depósitos de ahorro registrados en los últimos meses
            </p>
          </div>
        ) : (
          <div className="flex h-48 items-end justify-between border-b border-slate-100 px-2 pb-2 dark:border-slate-800 sm:px-6">
            {monthlyPoints.map((point) => {
              const heightPercent = Math.max((point.aportes / maxMonthly) * 100, point.aportes > 0 ? 6 : 0)
              return (
                <div key={point.mes} className="flex w-10 flex-col items-center gap-2 sm:w-14">
                  <div className="flex h-36 w-full items-end justify-center">
                    <div
                      className="group relative w-5 cursor-pointer rounded-t-md bg-teal-500 transition-all duration-300 hover:bg-teal-600 dark:bg-teal-500/80 dark:hover:bg-teal-400 sm:w-6"
                      style={{ height: `${heightPercent}%` }}
                    >
                      {point.aportes > 0 && (
                        <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:bg-slate-700">
                          {formatSoles(point.aportes)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{point.mes}</span>
                </div>
              )
            })}
          </div>
        )}
      </article>

      {/* 2. Composición del Fondo de Ahorro (Donut) */}
      <article className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Composición del Fondo</h2>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500">Cargando…</div>
        ) : composition.length === 0 ? (
          <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 p-6 text-center dark:border-slate-800/80 dark:bg-slate-900/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <PieChart className="h-4 w-4" aria-hidden />
            </div>
            <p className="max-w-xs text-xs font-medium text-slate-500 dark:text-slate-400">
              No hay ahorros activos actualmente
            </p>
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
                {composition.map((segment) => {
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
                  Fondo
                </text>
                <text
                  x={CENTER}
                  y={CENTER + 10}
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-medium dark:fill-slate-500"
                >
                  {composition.length} partes
                </text>
              </svg>
            </div>

            <ul className="mt-2 space-y-2">
              {composition.map((seg) => (
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
    </div>
  )
}
