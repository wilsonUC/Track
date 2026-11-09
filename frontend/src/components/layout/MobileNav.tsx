import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, CreditCard, FileBarChart, PiggyBank, Sparkles, Target } from 'lucide-react'
import { menuItems } from '../../constants/navigation'
import { sectionPaths } from '../../constants/routes'
import type { Section } from '../../types/finance'
import { NavIcon } from './navIcons'

type MobileNavProps = {
  isStaff: boolean
  isAvanzado?: boolean
}

const planItems = [
  { id: 'ahorros' as Section, label: 'Ahorros', icon: PiggyBank, desc: 'Fondos y depósitos de ahorro' },
  { id: 'presupuestos' as Section, label: 'Presupuestos', icon: CreditCard, desc: 'Límites mensuales de gasto' },
  { id: 'metas' as Section, label: 'Metas', icon: Target, desc: 'Objetivos de ahorro a plazo' },
  { id: 'reportes' as Section, label: 'Reportes', icon: FileBarChart, desc: 'Gráficos y análisis financiero' },
]

export function MobileNav({ isStaff, isAvanzado = false }: MobileNavProps) {
  const { pathname } = useLocation()
  const [isPlanesOpen, setIsPlanesOpen] = useState(false)
  const [shouldRenderDock, setShouldRenderDock] = useState(false)
  const [isAnimatingIn, setIsAnimatingIn] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Controlar ciclo de animación de entrada y salida
  useEffect(() => {
    let animTimer: ReturnType<typeof setTimeout>
    let unmountTimer: ReturnType<typeof setTimeout>

    if (isPlanesOpen) {
      setShouldRenderDock(true)
      // 30ms asegura que el DOM pinte el frame inicial (oculto) antes de iniciar la transición
      animTimer = setTimeout(() => {
        setIsAnimatingIn(true)
      }, 30)
    } else {
      setIsAnimatingIn(false)
      // 340ms da tiempo completo para que termine la animación en cascada de salida
      unmountTimer = setTimeout(() => {
        setShouldRenderDock(false)
      }, 340)
    }

    return () => {
      clearTimeout(animTimer)
      clearTimeout(unmountTimer)
    }
  }, [isPlanesOpen])

  const isPlanesActive =
    pathname.startsWith('/ahorros') ||
    pathname.startsWith('/presupuestos') ||
    (Boolean(isAvanzado || isStaff) && pathname.startsWith('/metas')) ||
    pathname.startsWith('/reportes')

  const visiblePlanItems = planItems.filter((plan) => {
    if (plan.id === 'metas' && !isAvanzado && !isStaff) return false
    return true
  })

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setIsPlanesOpen(false)
  }, [pathname])

  // Cerrar al hacer clic o tocar fuera del dock y del botón
  useEffect(() => {
    if (!isPlanesOpen) return

    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null
      if (!target) return
      // Ignorar si el clic fue dentro del dock flotante o en el propio botón de planes
      if (
        popupRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }
      setIsPlanesOpen(false)
    }

    // Retraso de 50ms para evitar que el mismo clic que abrió el menú lo cierre
    const timer = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick)
    }, 50)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleOutsideClick)
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
      (!item.adminOnly || isStaff) &&
      (!item.advancedOnly || isAvanzado || isStaff),
  )

  for (const item of availableItems) {
    if (item.id === 'ahorros') {
      navElements.push({
        type: 'group',
        id: 'planes',
        label: 'Planes',
        shortLabel: 'Planes',
      })
    } else if (item.id === 'presupuestos' || item.id === 'metas' || item.id === 'reportes') {
      // Se omiten porque están dentro del grupo "planes"
      continue
    } else {
      navElements.push({ type: 'item', data: item })
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:hidden"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}
      aria-label="Navegación principal"
    >
      {/* Telón sutil con micro-desenfoque para cerrar al tocar fuera (solo cubre arriba de la barra inferior) */}
      {shouldRenderDock && (
        <div
          className={`fixed inset-x-0 top-0 z-40 bg-slate-950/20 backdrop-blur-[2px] md:hidden transition-opacity duration-200 ease-out ${
            isAnimatingIn ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ bottom: 'max(3.75rem, calc(3.5rem + env(safe-area-inset-bottom)))' }}
          onClick={() => setIsPlanesOpen(false)}
          aria-hidden
        />
      )}

      <div className="relative mx-auto w-full max-w-md">
        {/* Action Dock flotante para Planes (Nubank / Revolut Style) */}
        {shouldRenderDock && (
          <div
            ref={popupRef}
            className="absolute bottom-full mb-3 right-12 sm:right-16 z-50 flex flex-col items-end gap-2.5 pointer-events-auto"
          >
            {(() => {
              const reversedItems = visiblePlanItems.slice().reverse()
              const total = reversedItems.length
              return reversedItems.map((plan, index) => {
                const Icon = plan.icon
                const isCurrent = pathname.startsWith(sectionPaths[plan.id])
                const entryDelay = index * 70
                const exitDelay = (total - 1 - index) * 55
                const currentDelay = isAnimatingIn ? `${entryDelay}ms` : `${exitDelay}ms`
                return (
                  <Link
                    key={plan.id}
                    to={sectionPaths[plan.id]}
                    onClick={() => setIsPlanesOpen(false)}
                    className={`group flex items-center gap-2.5 rounded-full py-1.5 pl-3.5 pr-1.5 shadow-lg backdrop-blur-xl transition-all duration-200 active:scale-95 whitespace-nowrap ${
                      isAnimatingIn
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
                    } ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border border-indigo-500 shadow-indigo-500/35 ring-2 ring-indigo-400/30'
                        : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-slate-900/10'
                    }`}
                    style={{
                      transitionDelay: currentDelay,
                      transitionTimingFunction: isAnimatingIn
                        ? 'cubic-bezier(0.34, 1.4, 0.64, 1)'
                        : 'cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-semibold tracking-tight">
                      <span>{plan.label}</span>
                      {isCurrent && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs shadow-xs transition-colors ${
                        isCurrent
                          ? 'bg-white text-indigo-600'
                          : 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    </span>
                  </Link>
                )
              })
            })()}
          </div>
        )}

        <div className="scrollbar-none flex w-full items-center justify-around gap-1 overflow-x-auto px-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navElements.map((el) => {
          if (el.type === 'group') {
            return (
              <button
                ref={buttonRef}
                key={el.id}
                type="button"
                onClick={() => setIsPlanesOpen((prev) => !prev)}
                className={`flex flex-1 min-w-[3.5rem] max-w-24 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium leading-tight transition active:scale-95 ${
                  isPlanesActive || isPlanesOpen
                    ? 'bg-indigo-100 font-semibold text-indigo-900 dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-500 active:bg-slate-100 dark:text-slate-400 dark:active:bg-slate-800'
                }`}
                aria-label="Abrir planes, presupuestos y reportes"
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
                <span className="flex items-center justify-center gap-0.5 truncate w-full text-center">
                  <span>{el.shortLabel}</span>
                  <ChevronDown
                    className={`h-3 w-3 shrink-0 transition-transform duration-200 ease-out ${
                      isPlanesOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'rotate-0 text-slate-400 dark:text-slate-500'
                    }`}
                    aria-hidden
                  />
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
                className="flex flex-1 min-w-[3.5rem] max-w-24 shrink-0 cursor-not-allowed flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium leading-tight text-slate-300"
                title="Sección bloqueada por ahora"
              >
                <span className="text-slate-300">
                  <NavIcon section={item.id} />
                </span>
                <span className="truncate w-full text-center">{label}</span>
              </button>
            )
          }
          if (item.id === 'ia') {
            return (
              <NavLink
                key={item.id}
                to={sectionPaths[item.id as Section]}
                className={({ isActive }) =>
                  `relative flex flex-1 min-w-[3.5rem] max-w-24 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] leading-tight transition active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/35 ring-2 ring-purple-300/50 dark:ring-purple-400/50 font-bold'
                      : 'border border-indigo-200/90 bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-pink-50/70 shadow-xs shadow-indigo-500/10 active:opacity-90 dark:border-purple-700/60 dark:from-indigo-950/60 dark:via-purple-950/50 dark:to-pink-950/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="absolute top-1 right-1.5 flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
                      <span
                        className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                          isActive ? 'bg-white' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}
                      ></span>
                    </span>
                    <span
                      className={
                        isActive
                          ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                          : 'text-indigo-600 drop-shadow-[0_1px_3px_rgba(99,102,241,0.35)] dark:text-purple-300'
                      }
                    >
                      <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
                    </span>
                    <span
                      className={`truncate w-full text-center tracking-wide ${
                        isActive
                          ? 'font-black text-white'
                          : 'font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300'
                      }`}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          }

          return (
            <NavLink
              key={item.id}
              to={sectionPaths[item.id as Section]}
              end={item.id === 'dashboard'}
              className={({ isActive }) =>
                `flex flex-1 min-w-[3.5rem] max-w-24 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium leading-tight transition ${
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
                  <span className="truncate w-full text-center">{label}</span>
                </>
              )}
            </NavLink>
          )
        })}
        </div>
      </div>
    </nav>
  )
}
