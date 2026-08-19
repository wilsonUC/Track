import { useEffect, useRef, useState } from 'react'
import { LogOut, Moon, Plus, Settings, ShieldCheck, Sun, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { sectionSubtitle, sectionTitle } from '../../constants/sectionLabels'
import { cuentaPath, sectionPaths } from '../../constants/routes'
import { usePreferences } from '../../context/PreferencesContext'
import type { Section } from '../../types/finance'
import { NavIcon } from './navIcons'

type MainHeaderProps = {
  section: Section
  displayName: string
  userEmail?: string
  userInitial?: string
  isStaff?: boolean
  onOpenNewTransaction: () => void
  onLogout?: () => void
  secondaryAction?: {
    label: string
    onClick: () => void
  } | null
  hasExtra?: boolean
}

const sectionCategoryTag: Record<Section, string> = {
  dashboard: 'Resumen General',
  ingresos: 'Entradas de Dinero',
  gastos: 'Control de Gastos',
  ahorros: 'Fondo de Ahorro',
  presupuestos: 'Límites & Control',
  metas: 'Objetivos Financieros',
  recurrentes: 'Suscripciones & Pagos',
  reportes: 'Métricas & Estadísticas',
  consejos: 'Educación Financiera',
  ia: 'Asistente Inteligente',
  admin: 'Panel Administrador',
  configuracion: 'Preferencias',
}

export function MainHeader({
  section,
  displayName,
  userEmail = '',
  userInitial,
  isStaff = false,
  onOpenNewTransaction,
  onLogout,
  secondaryAction,
  hasExtra,
}: MainHeaderProps) {
  const { pathname } = useLocation()
  const { preferences, savePreferences } = usePreferences()

  const isDashboard = section === 'dashboard'
  const isCuenta = pathname === cuentaPath
  const isAdmin = section === 'admin'
  const isConfiguracion = section === 'configuracion'

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isDark =
    preferences?.tema === 'oscuro' ||
    (preferences?.tema === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const handleToggleTheme = () => {
    void savePreferences({ tema: isDark ? 'claro' : 'oscuro' })
  }

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <header
      className={`flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between ${
        hasExtra ? 'mb-2.5 sm:mb-3.5' : 'mb-5 sm:mb-6'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Lado izquierdo: Icono de módulo (en mobile) + Micro-tag contextual + Título */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/80 text-indigo-600 shadow-xs backdrop-blur-sm dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400 sm:hidden">
            {isCuenta ? <User className="h-5 w-5" /> : <NavIcon section={section} />}
          </div>

          <div className="min-w-0">
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 sm:hidden">
              {isCuenta ? 'Seguridad & Perfil' : sectionCategoryTag[section]}
            </span>

            {isCuenta ? (
              <>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  Mi Cuenta
                </h2>
                <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
                  Visualiza y actualiza la información de tu perfil y preferencias de seguridad.
                </p>
              </>
            ) : isDashboard ? (
              <>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  ¡Hola, {displayName}!
                </h2>
                <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
                  Vista general de tus finanzas
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-black capitalize tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {sectionTitle[section]}
                </h2>
                <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
                  {sectionSubtitle[section]}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Lado derecho: Toolbar de utilidades para mobile (Toggle Tema + Menú Avatar) */}
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          {/* Botón rápido de alternar tema */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 shadow-xs backdrop-blur-sm transition-all hover:bg-slate-100 active:scale-95 dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Menú desplegable del avatar */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`flex shrink-0 items-center justify-center rounded-full p-0.5 transition-all duration-200 active:scale-95 ${
                isCuenta || isConfiguracion || isMenuOpen
                  ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950'
                  : 'ring-1 ring-slate-200/80 hover:ring-indigo-400 dark:ring-slate-800'
              }`}
              aria-label="Opciones de usuario"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-xs font-bold text-white shadow-sm shadow-indigo-500/20">
                {userInitial || (displayName ? displayName.charAt(0).toUpperCase() : 'U')}
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[210px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 animate-in fade-in zoom-in-95 duration-150">
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{displayName}</p>
                  <p className="truncate text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    {userEmail || 'Mi Cuenta'}
                  </p>
                </div>

                <div className="mt-1 space-y-0.5">
                  <Link
                    to={cuentaPath}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                      isCuenta
                        ? 'bg-indigo-50 font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    }`}
                  >
                    <User className="h-4 w-4 text-indigo-500" />
                    <span>Mi Perfil</span>
                  </Link>

                  <Link
                    to={sectionPaths.configuracion}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                      isConfiguracion
                        ? 'bg-indigo-50 font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    }`}
                  >
                    <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span>Configuración</span>
                  </Link>

                  {isStaff && (
                    <Link
                      to={sectionPaths.admin}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                        isAdmin
                          ? 'bg-indigo-50 font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      <span>Administración</span>
                    </Link>
                  )}

                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        onLogout()
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isCuenta && !isAdmin && !isConfiguracion && (
        <div className="flex w-full shrink-0 flex-row items-center gap-2 sm:w-auto sm:flex-wrap">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 sm:flex-initial sm:rounded-full sm:px-5 sm:py-2.5 sm:text-xs"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
              <span className="truncate">{secondaryAction.label}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenNewTransaction}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 sm:flex-initial sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm ${
              isDashboard ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            <span className="truncate">Nueva transacción</span>
          </button>
        </div>
      )}
    </header>
  )
}
