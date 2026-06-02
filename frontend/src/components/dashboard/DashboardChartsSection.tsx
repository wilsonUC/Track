import { DashboardMonthlyChart } from './DashboardMonthlyChart'

export function DashboardChartsSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">      <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-800">Gastos por categoría</h3>
        </div>
        <div className="relative flex min-h-[220px] items-center justify-center p-6">
          <svg
            className="pointer-events-none absolute inset-0 m-auto h-32 w-32 text-slate-100"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M11 2v10H2a10 10 0 1010-10h-1zm1 0a10 10 0 0110 10h-10V2z" opacity="0.4" />
          </svg>
          <p className="relative text-sm text-slate-500">No hay gastos para mostrar</p>
        </div>
      </article>

      <DashboardMonthlyChart />
    </div>
  )
}