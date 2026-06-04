import type { MovementType } from '../../types/finance'

type DashboardMonthCardProps = {
  variant: MovementType
}

const mockIncomeList = [
  { id: 1, descripcion: 'Pago de trabajo principal', monto: 4500, fecha: '27 mar. 2026', categoria: 'Trabajo' },
  { id: 2, descripcion: 'Ventas de consultoría negocio', monto: 600, fecha: '28 mar. 2026', categoria: 'Negocio' },
  { id: 3, descripcion: 'Dividendos de inversiones', monto: 150, fecha: '25 mar. 2026', categoria: 'Inversiones' },
  { id: 4, descripcion: 'Reembolso de gastos médicos', monto: 200, fecha: '22 mar. 2026', categoria: 'Reembolsos' },
  { id: 5, descripcion: 'Regalo de cumpleaños familiar', monto: 100, fecha: '18 mar. 2026', categoria: 'Regalos' },
  { id: 6, descripcion: 'Comisiones de ventas extras', monto: 350, fecha: '12 mar. 2026', categoria: 'Comisiones' },
]

const mockExpenseList = [
  { id: 1, descripcion: 'Compra de víveres del mes', monto: 1200, fecha: '15 mar. 2026', categoria: 'Alimentación' },
  { id: 2, descripcion: 'Pago de servicios (luz, agua e internet)', monto: 800, fecha: '10 mar. 2026', categoria: 'Servicios' },
  { id: 3, descripcion: 'Combustible y mantenimiento auto', monto: 400, fecha: '20 mar. 2026', categoria: 'Transporte' },
  { id: 4, descripcion: 'Suscripción Netflix y Spotify', monto: 60, fecha: '05 mar. 2026', categoria: 'Entretenimiento' },
  { id: 5, descripcion: 'Consulta odontológica de control', monto: 150, fecha: '08 mar. 2026', categoria: 'Salud' },
  { id: 6, descripcion: 'Salida a cenar restaurante', monto: 120, fecha: '14 mar. 2026', categoria: 'Alimentación' },
  { id: 7, descripcion: 'Compra de libros de desarrollo técnico', monto: 180, fecha: '19 mar. 2026', categoria: 'Educación' },
]

function formatSoles(value: number) {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Helper para obtener iconos y estilos específicos para cada categoría
function getCategoryInfo(categoria: string) {
  switch (categoria) {
    case 'Trabajo':
      return {
        bg: 'bg-indigo-50 text-indigo-600',
        badge: 'bg-indigo-50/70 text-indigo-700 border-indigo-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15m16.5 0c0-1.242-1.008-2.25-2.25-2.25H6c-1.242 0-2.25 1.008-2.25 2.25m16.5 0V8.625c0-.621-.504-1.125-1.125-1.125h-2.625V4.875A1.125 1.125 0 0015 3.75H9a1.125 1.125 0 00-1.125 1.125v2.625H5.25A1.125 1.125 0 004.125 8.625v5.525" />
          </svg>
        ),
      }
    case 'Negocio':
      return {
        bg: 'bg-emerald-50 text-emerald-600',
        badge: 'bg-emerald-50/70 text-emerald-700 border-emerald-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
          </svg>
        ),
      }
    case 'Alimentación':
      return {
        bg: 'bg-rose-50 text-rose-600',
        badge: 'bg-rose-50/70 text-rose-700 border-rose-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        ),
      }
    case 'Servicios':
      return {
        bg: 'bg-violet-50 text-violet-600',
        badge: 'bg-violet-50/70 text-violet-700 border-violet-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        ),
      }
    case 'Transporte':
      return {
        bg: 'bg-amber-50 text-amber-600',
        badge: 'bg-amber-50/70 text-amber-700 border-amber-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.847-13.56A1.875 1.875 0 0018.785 3H5.215a1.875 1.875 0 00-1.833 1.616L2.535 18.176c-.039.62.469 1.124 1.09 1.124H5.25M16.5 18.75h-9" />
          </svg>
        ),
      }
    case 'Inversiones':
      return {
        bg: 'bg-emerald-50 text-emerald-600',
        badge: 'bg-emerald-50/70 text-emerald-700 border-emerald-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9.75 12 2.25 6v4.5L12 12 2.25 15V18z" />
          </svg>
        ),
      }
    case 'Reembolsos':
      return {
        bg: 'bg-teal-50 text-teal-600',
        badge: 'bg-teal-50/70 text-teal-700 border-teal-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      }
    case 'Regalos':
      return {
        bg: 'bg-pink-50 text-pink-600',
        badge: 'bg-pink-50/70 text-pink-700 border-pink-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        ),
      }
    case 'Comisiones':
      return {
        bg: 'bg-cyan-50 text-cyan-600',
        badge: 'bg-cyan-50/70 text-cyan-700 border-cyan-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.75H3.75a1.125 1.125 0 00-1.125 1.125v14.25a1.125 1.125 0 001.125 1.125h16.5a1.125 1.125 0 001.125-1.125V5.625a1.125 1.125 0 00-1.125-1.125z" />
          </svg>
        ),
      }
    case 'Entretenimiento':
      return {
        bg: 'bg-purple-50 text-purple-600',
        badge: 'bg-purple-50/70 text-purple-700 border-purple-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.913-6.247m-8.913 0L3 13.5 18.75 3 15 21l-5.187-5.096z" />
          </svg>
        ),
      }
    case 'Educación':
      return {
        bg: 'bg-sky-50 text-sky-600',
        badge: 'bg-sky-50/70 text-sky-700 border-sky-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        ),
      }
    case 'Salud':
      return {
        bg: 'bg-rose-50 text-rose-600',
        badge: 'bg-rose-50/70 text-rose-700 border-rose-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0 7.5 7.5 0 00-15 0z" />
          </svg>
        ),
      }
    default:
      return {
        bg: 'bg-slate-50 text-slate-600',
        badge: 'bg-slate-50/70 text-slate-700 border-slate-100',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.913-6.247m-8.913 0L3 13.5 18.75 3 15 21l-5.187-5.096z" />
          </svg>
        ),
      }
  }
}

export function DashboardMonthCard({ variant }: DashboardMonthCardProps) {
  const isIncome = variant === 'income'
  const title = isIncome ? 'Ingresos del mes' : 'Gastos del mes'
  const list = isIncome ? mockIncomeList : mockExpenseList
  const totalAmount = list.reduce((sum, item) => sum + item.monto, 0)
  const formattedTotal = isIncome ? `+${formatSoles(totalAmount)}` : `-${formatSoles(totalAmount)}`

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md duration-200">
      {/* Cabecera de la tarjeta mensual */}
      <div
        className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${isIncome ? 'border-emerald-100 bg-emerald-50/10' : 'border-rose-100 bg-rose-50/10'
          }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              {isIncome ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9.75 12 2.25 6v4.5L12 12 2.25 15V18z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 18l-7.5-6 7.5-6v4.5L12 12l9.75 3V18z" />
              )}
            </svg>
          </div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <p className={`text-lg font-bold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
          {formattedTotal}
        </p>
      </div>

      {/* Contenedor de lista con Scroll Interno Limitado */}
      <div className="p-4">
        <div className="max-h-[280px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          <ul className="flex flex-col gap-1.5">
            {list.map((item) => {
              const catInfo = getCategoryInfo(item.categoria)
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl transition duration-150 hover:bg-slate-50/80 cursor-default"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icono de Categoría */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${catInfo.bg}`}>
                      {catInfo.icon}
                    </div>

                    {/* Detalles de la transacción */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-700">{item.descripcion}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-all ${catInfo.badge}`}>
                          {item.categoria}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.fecha}</span>
                      </div>
                    </div>
                  </div>

                  {/* Monto */}
                  <p className={`shrink-0 text-sm font-bold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isIncome ? `+${formatSoles(item.monto)}` : `-${formatSoles(item.monto)}`}
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
