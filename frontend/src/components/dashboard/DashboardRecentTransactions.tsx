const mockRecentTransactions = [
  {
    id: 1,
    descripcion: 'Inversiones en bitcoin',
    monto: 1000,
    fecha: '28 may. 2026',
    tipo: 'income',
    categoria: 'Inversiones',
  },
  {
    id: 2,
    descripcion: 'Ventas de negocio local',
    monto: 60,
    fecha: '28 may. 2026',
    tipo: 'income',
    categoria: 'Negocio',
  },
  {
    id: 3,
    descripcion: 'Compra de mascarillas quirúrgicas',
    monto: 10,
    fecha: '27 may. 2026',
    tipo: 'expense',
    categoria: 'Salud',
  },
  {
    id: 4,
    descripcion: 'Prueba de pago almuerzo',
    monto: 45.5,
    fecha: '27 may. 2026',
    tipo: 'expense',
    categoria: 'Alimentación',
  },
  {
    id: 5,
    descripcion: 'Pago de trabajo quincenal',
    monto: 1200,
    fecha: '27 may. 2026',
    tipo: 'income',
    categoria: 'Trabajo',
  },
  {
    id: 6,
    descripcion: 'Transporte en scooter eléctrico',
    monto: 45.5,
    fecha: '27 may. 2026',
    tipo: 'expense',
    categoria: 'Transporte',
  },
]

function formatSoles(value: number) {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function DashboardRecentTransactions() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Cabecera */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.172-.879-1.172-2.303 0-3.182C10.536 7.88 11.304 7.66 12 7.66c.768 0 1.536.22 2.121.659l.879.659"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-slate-800">Todas las transacciones recientes</h3>
      </div>

      {/* Lista de Transacciones */}
      <div className="p-5">
        <div className="max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          <ul className="divide-y divide-slate-100">
            {mockRecentTransactions.map((t) => {
              const isIncome = t.tipo === 'income'
              return (
                <li key={t.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icono de Tipo de Transacción */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      <svg
                        className="h-4.5 w-4.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        {isIncome ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
                        )}
                      </svg>
                    </div>

                    {/* Descripción y Metadata */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-700">{t.descripcion}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                          {t.categoria}
                        </span>
                        <span className="text-[10px] text-slate-400">{t.fecha}</span>
                      </div>
                    </div>
                  </div>

                  {/* Monto */}
                  <p
                    className={`shrink-0 text-sm font-bold tabular-nums ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isIncome ? `+${formatSoles(t.monto)}` : `-${formatSoles(t.monto)}`}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </article>
  )
}
