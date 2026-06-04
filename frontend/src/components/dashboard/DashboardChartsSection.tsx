import { DashboardMonthlyChart } from './DashboardMonthlyChart'

const categoryExpenses = [
  {
    categoria: 'Alimentación',
    monto: 1200,
    porcentaje: 50,
    colorBg: 'bg-rose-500',
    colorLight: 'bg-rose-50 text-rose-600',
  },
  {
    categoria: 'Servicios',
    monto: 800,
    porcentaje: 33.3,
    colorBg: 'bg-violet-500',
    colorLight: 'bg-violet-50 text-violet-600',
  },
  {
    categoria: 'Transporte',
    monto: 400,
    porcentaje: 16.7,
    colorBg: 'bg-amber-500',
    colorLight: 'bg-amber-50 text-amber-600',
  },
]

function formatSoles(value: number) {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function DashboardChartsSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Tarjeta de Gastos por Categoría */}
      <article className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800">Gastos por categoría</h3>
          </div>

          {/* Distribución con barras de progreso estilizadas */}
          <div className="p-6 space-y-4">
            {categoryExpenses.map((c) => (
              <div key={c.categoria} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${c.colorLight}`}>
                      {c.porcentaje}%
                    </span>
                    <span className="font-semibold text-slate-700">{c.categoria}</span>
                  </div>
                  <span className="font-bold text-slate-700">{formatSoles(c.monto)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${c.colorBg}`}
                    style={{ width: `${c.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen inferior */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 rounded-b-2xl">
          <p className="text-xs text-slate-500 text-center">
            El 50% de tus egresos se concentra en la categoría de <strong className="text-slate-700">Alimentación</strong>.
          </p>
        </div>
      </article>

      {/* Gráfico mensual de líneas */}
      <DashboardMonthlyChart />
    </div>
  )
}