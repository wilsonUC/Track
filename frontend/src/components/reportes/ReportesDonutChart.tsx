import { PieChart } from 'lucide-react'
import type { DonutSegment } from '../../utils/reportesMetrics'
import type { ReportFilter } from './reportesTypes'

type ReportesDonutChartProps = {
  filter: ReportFilter
  segments: DonutSegment[]
  loading?: boolean
}

const RADIUS = 42
const STROKE = 16
const CENTER = 60
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function filterLabel(filter: ReportFilter) {
  if (filter === 'ingresos') return 'Ingresos'
  if (filter === 'gastos') return 'Gastos'
  return 'Todo'
}

export function ReportesDonutChart({ filter, segments, loading }: ReportesDonutChartProps) {
  let offset = 0

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <PieChart className="h-5 w-5 text-indigo-600" aria-hidden />
        <h2 className="text-sm font-bold text-slate-800">Distribución por categoría</h2>
      </div>

      {loading && (
        <div className="flex h-40 items-center justify-center text-sm text-slate-500">Cargando…</div>
      )}

      {!loading && segments.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
          <p className="px-4 text-center text-sm text-slate-500">Sin datos para este filtro</p>
        </div>
      )}

      {!loading && segments.length > 0 && (
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
                className="fill-slate-700 text-[11px] font-extrabold"
              >
                {filterLabel(filter)}
              </text>
              <text
                x={CENTER}
                y={CENTER + 10}
                textAnchor="middle"
                className="fill-slate-400 text-[9px] font-medium"
              >
                {segments.length} cat.
              </text>
            </svg>
          </div>

          <ul className="mt-2 space-y-1.5">
            {segments.map((segment) => (
              <li key={segment.nombre} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="flex min-w-0 items-center gap-2 text-slate-600">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.colorHex }}
                  />
                  <span className="truncate font-medium">{segment.nombre}</span>
                </span>
                <span className="shrink-0 font-bold text-slate-700">
                  {segment.porcentaje.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}
