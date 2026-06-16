type PresupuestosSummaryCardProps = {
  totalGastado: number
  totalLimite: number
  porcentajeGlobal: number
}

export function PresupuestosSummaryCard({
  totalGastado,
  totalLimite,
  porcentajeGlobal,
}: PresupuestosSummaryCardProps) {
  const enAlerta = porcentajeGlobal >= 90

  return (
    <article className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 md:grid-cols-3">
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Total consumido este mes
        </span>
        <div className="text-2xl font-black text-slate-900 sm:text-3xl">
          S/ {totalGastado.toFixed(2)}
          <span className="text-sm font-bold text-slate-400"> / S/ {totalLimite.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <div className="flex justify-between text-xs font-bold text-slate-600">
          <span>Uso del presupuesto total</span>
          <span className={`font-black ${enAlerta ? 'text-rose-500' : 'text-indigo-600'}`}>
            {porcentajeGlobal}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              enAlerta ? 'bg-rose-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(porcentajeGlobal, 100)}%` }}
          />
        </div>
      </div>
    </article>
  )
}
