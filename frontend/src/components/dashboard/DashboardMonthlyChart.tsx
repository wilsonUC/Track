import { ChartColumn } from 'lucide-react'
import { useState } from 'react'
import type { MonthChartPoint } from '../../utils/dashboardMetrics'
import { formatSoles } from '../../utils/financeFormat'

type DashboardMonthlyChartProps = {
  data: MonthChartPoint[]
  loading?: boolean
}

export function DashboardMonthlyChart({ data, loading }: DashboardMonthlyChartProps) {
  const [chartType, setChartType] = useState<'income' | 'expense'>('income')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const isIncome = chartType === 'income'
  const activeColor = isIncome ? '#10b981' : '#f43f5e'
  const activeBgColor = isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'

  const values = data.map((d) => (isIncome ? d.ingresos : d.gastos))
  const maxValue = Math.max(...values, 1)
  const yTicks = [0, Math.round(maxValue / 2), maxValue]

  const chartWidth = 500
  const chartHeight = 190
  const startX = 45
  const endX = 480
  const startY = 20
  const endY = 150
  const usableWidth = endX - startX
  const usableHeight = endY - startY

  const points =
    data.length > 0
      ? data.map((item, i) => {
          const val = isIncome ? item.ingresos : item.gastos
          const x = data.length === 1 ? startX + usableWidth / 2 : startX + (i / (data.length - 1)) * usableWidth
          const y = endY - (val / maxValue) * usableHeight
          return { x, y, value: val, mes: item.mes }
        })
      : []

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath =
    points.length > 0
      ? `M ${points[0].x} ${endY} ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} ${endY} Z`
      : ''

  const lastPoint = points[points.length - 1]

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm transition">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${activeBgColor}`}>
            <ChartColumn className="h-5 w-5" aria-hidden />
          </div>
          <h3 className="font-semibold text-slate-800">Resumen mensual</h3>
        </div>

        <div className="flex rounded-lg bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setChartType('income')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              isIncome ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ingresos
          </button>
          <button
            type="button"
            onClick={() => setChartType('expense')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              !isIncome ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gastos
          </button>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {loading && <p className="py-16 text-center text-sm text-slate-500">Cargando…</p>}

        {!loading && (
          <div className="relative">
            {hoveredIndex !== null && points[hoveredIndex] && (
              <div
                className="pointer-events-none absolute z-10 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg transition-all duration-150 ease-out"
                style={{
                  left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
                  top: `${(points[hoveredIndex].y / chartHeight) * 100 - 25}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="font-semibold text-center">{points[hoveredIndex].mes}</div>
                <div className="text-[10px] text-slate-300 text-center">
                  {formatSoles(points[hoveredIndex].value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 bg-slate-900" />
              </div>
            )}

            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" className="overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={activeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {yTicks.map((tick) => {
                const y = endY - (tick / maxValue) * usableHeight
                return (
                  <g key={tick} className="opacity-75">
                    <line x1={startX} y1={y} x2={endX} y2={y} stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth={1} />
                    <text
                      x={startX - 10}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] font-medium fill-slate-400 tabular-nums"
                    >
                      {tick}
                    </text>
                  </g>
                )
              })}

              {hoveredIndex !== null && points[hoveredIndex] && (
                <line
                  x1={points[hoveredIndex].x}
                  y1={startY}
                  x2={points[hoveredIndex].x}
                  y2={endY}
                  stroke="#cbd5e1"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                />
              )}

              {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={activeColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {points.map((p, i) => (
                <g key={`${p.mes}-${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIndex === i ? 6 : 4}
                    fill={hoveredIndex === i ? activeColor : '#ffffff'}
                    stroke={activeColor}
                    strokeWidth={hoveredIndex === i ? 2 : 2.5}
                    className="transition-all duration-150"
                  />
                  <text
                    x={p.x}
                    y={endY + 20}
                    textAnchor="middle"
                    className={`text-[10px] font-medium transition-colors duration-150 ${
                      hoveredIndex === i ? 'fill-slate-800 font-semibold' : 'fill-slate-400'
                    }`}
                  >
                    {p.mes}
                  </text>
                  <rect
                    x={p.x - 25}
                    y={startY}
                    width={50}
                    height={endY - startY + 30}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              ))}
            </svg>
          </div>
        )}

        {!loading && lastPoint && (
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {isIncome ? 'Ingresos' : 'Gastos'} ({lastPoint.mes}:{' '}
              {formatSoles(lastPoint.value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })})
            </span>
          </div>
        )}
      </div>
    </article>
  )
}
