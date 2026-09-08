import { useEffect, useState, type ReactNode } from 'react'
import { PreferencesProvider } from '../context/PreferencesContext'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { fetchProfile, logout, profileDisplayName, profileInitial, type UserProfile } from '../api/auth'
import { sectionFromPath } from '../constants/routes'
import { MainHeader } from '../components/layout/MainHeader'
import { MobileNav } from '../components/layout/MobileNav'
import { Sidebar } from '../components/layout/Sidebar'
import { NewTransactionModal } from '../components/transactions/NewTransactionModal'
import type { MovementType } from '../types/finance'

function defaultMovementType(pathname: string): MovementType {
  if (pathname.startsWith('/ingresos')) return 'income'
  if (pathname.startsWith('/gastos')) return 'expense'
  return 'expense'
}

export function AppLayout() {
  const { pathname } = useLocation()
  const section = sectionFromPath(pathname)

  const [showModal, setShowModal] = useState(false)
  const [movementType, setMovementType] = useState<MovementType>(() => defaultMovementType(pathname))
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [transactionsVersion, setTransactionsVersion] = useState(0)
  const [secondaryHeaderAction, setSecondaryHeaderAction] = useState<{
    label: string
    onClick: () => void
  } | null>(null)
  const [headerExtra, setHeaderExtra] = useState<ReactNode | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  async function refreshProfile() {
    try {
      const data = await fetchProfile()
      setProfile(data)
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    let cancelled = false
    fetchProfile()
      .then((data) => {
        if (cancelled) return
        // Si la cuenta expiró y no es admin, cerrar sesión automáticamente
        const isExp = data.is_expired || (data.fecha_expiracion && new Date(data.fecha_expiracion).getTime() <= Date.now())
        if (!data.is_staff && isExp) {
          logout()
          window.location.href = '/login?expired=1'
          return
        }
        setProfile(data)
      })
      .catch(() => {
        if (!cancelled) setProfile(null)
      })
      .finally(() => {
        if (!cancelled) setProfileLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Monitoreo en tiempo real de la vigencia mientras el usuario está en la app
  useEffect(() => {
    if (!profile || profile.is_staff || !profile.fecha_expiracion) return

    const expTime = new Date(profile.fecha_expiracion).getTime()
    if (isNaN(expTime)) return

    const checkExpiration = () => {
      if (Date.now() >= expTime) {
        logout()
        window.location.href = '/login?expired=1'
      }
    }

    const msUntilExp = expTime - Date.now()
    if (msUntilExp <= 0) {
      checkExpiration()
      return
    }

    const timer = setTimeout(checkExpiration, msUntilExp)
    const interval = setInterval(checkExpiration, 2000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [profile])

  function handleOpenNewTransaction() {
    setMovementType(defaultMovementType(pathname))
    setShowModal(true)
  }

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  const displayName = profile ? profileDisplayName(profile) : '…'
  const userEmail = profile?.email || ''
  const userInitial = profile ? profileInitial(profile) : '…'
  const userFoto = profile?.foto || null
  const isStaff = profile?.is_staff ?? false
  const isAvanzado = isStaff || profile?.tipo_cuenta === 'avanzado'
  const isAdminPath = pathname.startsWith('/admin')
  const isAdvancedPath =
    pathname.startsWith('/metas') ||
    pathname.startsWith('/recurrentes') ||
    pathname.startsWith('/consejos')

  if ((isAdminPath || isAdvancedPath) && !profileLoaded) {
    return (
      <div className="flex h-dvh items-center justify-center bg-slate-100 text-sm text-slate-500">
        Verificando permisos…
      </div>
    )
  }

  if (isAdminPath && !isStaff) {
    return <Navigate to="/" replace />
  }

  if (isAdvancedPath && !isAvanzado) {
    return <Navigate to="/" replace />
  }

  return (
    <PreferencesProvider>
      <div className="h-dvh overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100" data-app-shell>
      <Sidebar
        onLogout={handleLogout}
        displayName={displayName}
        email={userEmail}
        initial={userInitial}
        foto={userFoto}
        isStaff={isStaff}
        isAvanzado={isAvanzado}
      />

      <div className="flex h-full min-h-0 flex-col md:pl-64">
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* Encabezado fijo con efecto blur (frosted glass) de ancho completo */}
          <header className="sticky top-0 z-30 w-full bg-slate-100/75 px-4 py-3.5 backdrop-blur-xl backdrop-saturate-150 transition-colors dark:bg-slate-950/75 md:px-8">
            <div className="mx-auto max-w-6xl">
              <MainHeader
                section={section}
                displayName={displayName}
                userEmail={userEmail}
                userInitial={userInitial}
                userFoto={userFoto}
                isStaff={isStaff}
                onOpenNewTransaction={handleOpenNewTransaction}
                onLogout={handleLogout}
                secondaryAction={secondaryHeaderAction}
                hasExtra={Boolean(headerExtra)}
              />
              {headerExtra && <div className="mt-2.5">{headerExtra}</div>}
            </div>
          </header>

          {/* Contenido principal que se desliza por debajo del header con blur */}
          <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-8">
            <Outlet
              context={{
                transactionsVersion,
                bumpTransactions: () => setTransactionsVersion((v) => v + 1),
                refreshProfile,
                setSecondaryHeaderAction,
                setHeaderExtra,
                onLogout: handleLogout,
                isAvanzado,
                userFoto,
                userInitial,
                profile,
              }}
            />
          </div>
        </main>
        <MobileNav isStaff={isStaff} isAvanzado={isAvanzado} />
      </div>

      <NewTransactionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={() => setTransactionsVersion((v) => v + 1)}
        movementType={movementType}
        onMovementTypeChange={setMovementType}
        amount={amount}
        onAmountChange={setAmount}
        categoryId={categoryId}
        onCategoryIdChange={setCategoryId}
        date={date}
        onDateChange={setDate}
        description={description}
        onDescriptionChange={setDescription}
      />
      </div>
    </PreferencesProvider>
  )
}
