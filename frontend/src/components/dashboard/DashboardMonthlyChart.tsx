import { useState } from 'react'

/** Datos de ejemplo hasta conectar transacciones reales por mes */
const monthlyChartData = [
  { mes: 'Oct', ingresos: 3200, gastos: 2100 },
  { mes: 'Nov', ingresos: 4500, gastos: 3100 },
  { mes: 'Dic', ingresos: 5200, gastos: 4300 },
  { mes: 'Ene', ingresos: 3800, gastos: 2800 },
  { mes: 'Feb', ingresos: 4900, gastos: 3900 },
  { mes: 'Mar', ingresos: 5100, gastos: 2400 },
]

function formatSoles(value: number) {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function DashboardMonthlyChart() {
  const [chartType, setChartType] = useState<'income' | 'expense'>('income')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const isIncome = chartType === 'income'
  const activeColor = isIncome ? '#10b981' : '#f43f5e' // Tailwind emerald-500 y rose-500
  const activeBgColor = isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'

  // Filtrar los valores correspondientes al tipo seleccionado
  const values = monthlyChartData.map((d) => (isIncome ? d.ingresos : d.gastos))
  const maxValue = Math.max(...values, 1)

  // Ticks para el eje Y (mínimo, medio, máximo)
  const yTicks = [0, Math.round(maxValue / 2), maxValue]

  // Dimensiones del SVG y área utilizable del gráfico
  const chartWidth = 500
  const chartHeight = 190
  const startX = 45
  const endX = 480
  const startY = 20
  const endY = 150
  const usableWidth = endX - startX
  const usableHeight = endY - startY

  // Calcular las coordenadas exactas de cada punto en base a los datos
  const points = monthlyChartData.map((item, i) => {
    const val = isIncome ? item.ingresos : item.gastos
    const x = startX + (i / (monthlyChartData.length - 1)) * usableWidth
    const y = endY - (val / maxValue) * usableHeight
    return { x, y, value: val, mes: item.mes }
  })

  // Generar el path para dibujar la línea segmentada
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Generar el path para rellenar el área inferior con gradiente de color
  const areaPath = `M ${points[0].x} ${endY} ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} ${endY} Z`

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm transition">
      {/* Cabecera del gráfico con Toggle */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${activeBgColor}`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-800">Resumen mensual</h3>
        </div>

        {/* Toggle para cambiar entre Ingresos y Gastos */}
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
        <div className="relative">
          {/* Tooltip flotante */}
          {hoveredIndex !== null && (
            <div
              className="pointer-events-none absolute z-10 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg transition-all duration-150 ease-out"
              style={{
                left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
                top: `${(points[hoveredIndex].y / chartHeight) * 100 - 25}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="font-semibold text-center">{points[hoveredIndex].mes}</div>
              <div className="text-[10px] text-slate-300 text-center">{formatSoles(points[hoveredIndex].value)}</div>
              {/* Flechita del tooltip */}
              <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 bg-slate-900" />
            </div>
          )}

          {/* Gráfico SVG Responsivo */}
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width="100%"
            height="100%"
            className="overflow-visible"
          >
            <defs>
              {/* Gradiente dinámico adaptado al color seleccionado */}
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={activeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Líneas horizontales de fondo y textos del eje Y */}
            {yTicks.map((tick) => {
              const y = endY - (tick / maxValue) * usableHeight
              return (
                <g key={tick} className="opacity-75">
                  <line
                    x1={startX}
                    y1={y}
                    x2={endX}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
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

            {/* Línea vertical indicadora en hover */}
            {hoveredIndex !== null && (
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

            {/* Área rellena con gradiente */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Línea del gráfico */}
            <path
              d={linePath}
              fill="none"
              stroke={activeColor}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Puntos y zonas de interacción táctil/hover */}
            {points.map((p, i) => (
              <g key={p.mes}>
                {/* Punto visual básico en la curva */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === i ? 6 : 4}
                  fill={hoveredIndex === i ? activeColor : '#ffffff'}
                  stroke={activeColor}
                  strokeWidth={hoveredIndex === i ? 2 : 2.5}
                  className="transition-all duration-150"
                />

                {/* Texto del mes en el eje X */}
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

                {/* Rectángulo invisible para capturar el mouse de forma óptima */}
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

        {/* Leyenda */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {isIncome ? 'Ingresos' : 'Gastos'} (Marzo: {formatSoles(points[points.length - 1].value)})
          </span>
        </div>
      </div>
    </article>
  )
}
