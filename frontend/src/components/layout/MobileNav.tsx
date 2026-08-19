import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Check, CreditCard, PiggyBank, Target } from 'lucide-react'
import { menuItems } from '../../constants/navigation'
import { sectionPaths } from '../../constants/routes'
import type { Section } from '../../types/finance'
import { NavIcon } from './navIcons'

type MobileNavProps = {
  isStaff: boolean
}

const planItems = [
  { id: 'ahorros' as Section, label: 'Ahorros', icon: PiggyBank, desc: 'Fondos y depósitos de ahorro' },
  { id: 'presupuestos' as Section, label: 'Presupuestos', icon: CreditCard, desc: 'Límites mensuales de gasto' },
  { id: 'metas' as Section, label: 'Metas', icon: Target, desc: 'Objetivos de ahorro a plazo' },
]

export function MobileNav({ isStaff }: MobileNavProps) {
  const { pathname } = useLocation()
  const [isPlanesOpen, setIsPlanesOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  const isPlanesActive =
    pathname.startsWith('/ahorros') ||
    pathname.startsWith('/presupuestos') ||
    pathname.startsWith('/metas')

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setIsPlanesOpen(false)
  }, [pathname])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPlanesOpen(false)
      }
    }
    if (isPlanesOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPlanesOpen])

  // Construir la lista de elementos para el navbar móvil agrupando Ahorros, Presupuestos y Metas
  const navElements: Array<
    | { type: 'item'; data: (typeof menuItems)[number] }
    | { type: 'group'; id: 'planes'; label: string; shortLabel: string }
  > = []

  const availableItems = menuItems.filter(
    (item) =>
      item.id !== 'configuracion' &&
      item.id !== 'admin' &&
      (!item.adminOnly || isStaff),
  )

  for (const item of availableItems) {
    if (item.id === 'ahorros') {
      navElements.push({
        type: 'group',
        id: 'planes',
        label: 'Planes',
        shortLabel: 'Planes',
      })
    } else if (item.id === 'presupuestos' || item.id === 'metas') {
      // Se omiten porque están dentro del grupo "planes"
      continue
    } else {
      navElements.push({ type: 'item', data: item })
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:hidden"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}
      aria-label="Navegación principal"
    >
      {/* Menú flotante emergente para el grupo de Planes (Ahorros, Presupuestos, Metas) */}
      {isPlanesOpen && (
        <div
          ref={popupRef}
          className="animate-in fade-in slide-in-from-bottom-3 duration-200 absolute bottom-full left-3 right-3 z-50 mb-2.5 max-w-sm rounded-3xl border border-slate-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:left-auto sm:right-auto"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Target className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Planes & Objetivos</span>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              3 opciones
            </span>
          </div>

          <div className="mt-1 space-y-1">
            {planItems.map((plan) => {
              const Icon = plan.icon
              const isCurrent = pathname.startsWith(sectionPaths[plan.id])
              return (
                <Link
                  key={plan.id}
                  to={sectionPaths[plan.id]}
                  onClick={() => setIsPlanesOpen(false)}
                  className={`flex items-center justify-between rounded-2xl p-2.5 transition-all active:scale-98 ${
                    isCurrent
                      ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold">{plan.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-400">{plan.desc}</div>
                    </div>
                  </div>
                  {isCurrent && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="scrollbar-none flex gap-1 overflow-x-auto px-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navElements.map((el) => {
          if (el.type === 'group') {
            return (
              <button
                key={el.id}
                type="button"
                onClick={() => setIsPlanesOpen((prev) => !prev)}
                className={`flex min-w-17 max-w-23 shrink-0 flex-col items-center gap-0.5 rounded-lg px-1.5 py-2 text-[10px] font-medium leading-tight transition active:scale-95 ${
                  isPlanesActive || isPlanesOpen
                    ? 'bg-indigo-100 font-semibold text-indigo-900 dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-500 active:bg-slate-100 dark:text-slate-400 dark:active:bg-slate-800'
                }`}
                aria-label="Abrir planes y presupuestos"
                aria-expanded={isPlanesOpen}
              >
                <span
                  className={
                    isPlanesActive || isPlanesOpen
                      ? 'text-indigo-600 dark:text-indigo-300'
                      : 'text-slate-400 dark:text-slate-500'
                  }
                >
                  <Target className="h-5 w-5 shrink-0" aria-hidden />
                </span>
                <span className="line-clamp-2 w-full text-center font-bold">
                  {el.shortLabel} ▾
                </span>
              </button>
            )
          }

          const item = el.data
          const label = item.shortLabel ?? item.label
          if (item.disabled) {
            return (
              <button
                key={item.id}
                type="button"
                disabled
                className="flex min-w-17 max-w-23 shrink-0 cursor-not-allowed flex-col items-center gap-0.5 rounded-lg px-1.5 py-2 text-[10px] font-medium leading-tight text-slate-300"
                title="Sección bloqueada por ahora"
              >
                <span className="text-slate-300">
                  <NavIcon section={item.id} />
                </span>
                <span className="line-clamp-2 w-full text-center">{label}</span>
              </button>
            )
          }
          return (
            <NavLink
              key={item.id}
              to={sectionPaths[item.id as Section]}
              end={item.id === 'dashboard'}
              className={({ isActive }) =>
                `flex min-w-17 max-w-23 shrink-0 flex-col items-center gap-0.5 rounded-lg px-1.5 py-2 text-[10px] font-medium leading-tight transition ${
                  isActive
                    ? 'bg-indigo-100 font-semibold text-indigo-900 dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-500 active:bg-slate-100 dark:text-slate-400 dark:active:bg-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-300'
                        : 'text-slate-400 dark:text-slate-500'
                    }
                  >
                    <NavIcon section={item.id} />
                  </span>
                  <span className="line-clamp-2 w-full text-center">{label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
