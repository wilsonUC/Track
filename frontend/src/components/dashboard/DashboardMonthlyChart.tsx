/** Datos de ejemplo hasta conectar transacciones reales por mes */
const monthlyChartData = [
  { mes: 'Oct', ingresos: 3200, gastos: 2100 },
  { mes: 'Nov', ingresos: 4500, gastos: 3100 },
  { mes: 'Dic', ingresos: 5200, gastos: 4300 },
  { mes: 'Ene', ingresos: 3800, gastos: 2800 },
  { mes: 'Feb', ingresos: 4900, gastos: 3900 },
  { mes: 'Mar', ingresos: 5100, gastos: 2400 },
]

const CHART_HEIGHT = 160

function formatSoles(value: number) {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function DashboardMonthlyChart() {
  const maxValue = Math.max(...monthlyChartData.flatMap((d) => [d.ingresos, d.gastos]), 1)
  const yTicks = [0, Math.round(maxValue / 2), maxValue]

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
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

      <div className="px-4 py-5 sm:px-6">
        <div className="flex gap-3">
          {/* Eje Y */}
          <div
            className="flex shrink-0 flex-col justify-between text-[10px] text-slate-400 tabular-nums"
            style={{ height: CHART_HEIGHT }}
          >
            {[...yTicks].reverse().map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>

          {/* Área del gráfico */}
          <div className="min-w-0 flex-1">
            <div
              className="relative rounded-lg border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white"
              style={{ height: CHART_HEIGHT }}
            >
              {/* Líneas horizontales */}
              <div className="absolute inset-0 flex flex-col justify-between py-0">
                {yTicks.map((tick) => (
                  <div key={tick} className="border-t border-dashed border-slate-200/80" />
                ))}
              </div>

              {/* Barras */}
              <div className="absolute inset-x-2 bottom-0 top-2 flex items-end justify-between gap-1 sm:inset-x-4 sm:gap-2">
                {monthlyChartData.map((item) => (
                  <div key={item.mes} className="flex h-full flex-1 flex-col items-center justify-end">
                    <div className="flex h-full w-full max-w-[52px] items-end justify-center gap-1 sm:gap-1.5">
                      <div
                        className="w-[38%] max-w-[14px] rounded-t-md bg-rose-500 shadow-sm transition-all hover:bg-rose-600"
                        style={{ height: `${(item.gastos / maxValue) * 100}%`, minHeight: item.gastos > 0 ? 4 : 0 }}
                        title={`Gastos ${item.mes}: ${formatSoles(item.gastos)}`}
                      />
                      <div
                        className="w-[38%] max-w-[14px] rounded-t-md bg-emerald-500 shadow-sm transition-all hover:bg-emerald-600"
                        style={{ height: `${(item.ingresos / maxValue) * 100}%`, minHeight: item.ingresos > 0 ? 4 : 0 }}
                        title={`Ingresos ${item.mes}: ${formatSoles(item.ingresos)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meses */}
            <div className="mt-2 flex justify-between gap-1 px-1 text-center text-xs font-medium text-slate-500">
              {monthlyChartData.map((item) => (
                <span key={item.mes} className="flex-1">
                  {item.mes}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-5 flex items-center justify-center gap-6 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500" />
            Gastos
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            Ingresos
          </span>
        </div>
      </div>
    </article>
  )
}
