type MetasSummaryCardProps = {
  totalAcumulado: number
  totalObjetivo: number
  porcentajeGlobal: number
}

export function MetasSummaryCard({
  totalAcumulado,
  totalObjetivo,
  porcentajeGlobal,
}: MetasSummaryCardProps) {
  return (
    <article className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-3">
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Ahorro total acumulado
        </span>
        <div className="text-3xl font-black text-indigo-600">S/ {totalAcumulado.toFixed(2)}</div>
        <span className="block text-xs text-slate-500">
          De una meta global de S/ {totalObjetivo.toFixed(2)}
        </span>
      </div>

      <div className="space-y-2 md:col-span-2">
        <div className="flex justify-between text-xs font-bold text-slate-600">
          <span>Progreso general</span>
          <span className="font-black text-indigo-600">{porcentajeGlobal}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(porcentajeGlobal, 100)}%` }}
          />
        </div>
      </div>
    </article>
  )
}
