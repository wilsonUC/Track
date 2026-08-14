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
        if (!cancelled) setProfile(data)
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

  function handleOpenNewTransaction() {
    setMovementType(defaultMovementType(pathname))
    setShowModal(true)
  }

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  const displayName = profile ? profileDisplayName(profile) : '…'
  const userInitial = profile ? profileInitial(profile) : '…'
  const userEmail = profile?.email ?? ''
  const isStaff = profile?.is_staff ?? false
  const isAdminPath = pathname.startsWith('/admin')

  if (isAdminPath && !profileLoaded) {
    return (
      <div className="flex h-dvh items-center justify-center bg-slate-100 text-sm text-slate-500">
        Verificando permisos…
      </div>
    )
  }

  if (isAdminPath && !isStaff) {
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
        isStaff={isStaff}
      />

      <div className="flex h-full min-h-0 flex-col md:pl-64">
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-24 pt-5 md:px-8 md:pb-8 md:pt-8">
          <div className="mx-auto max-w-6xl">
            <div className="sticky -top-5 md:-top-8 z-30 -mt-5 bg-slate-100/80 pb-3 pt-5 backdrop-blur-md dark:bg-slate-950/80 md:-mt-8 md:pt-8">
              <MainHeader
                section={section}
                displayName={displayName}
                onOpenNewTransaction={handleOpenNewTransaction}
                secondaryAction={secondaryHeaderAction}
                hasExtra={Boolean(headerExtra)}
              />
              {headerExtra && <div className="mt-2">{headerExtra}</div>}
            </div>
            <Outlet
              context={{
                transactionsVersion,
                bumpTransactions: () => setTransactionsVersion((v) => v + 1),
                refreshProfile,
                setSecondaryHeaderAction,
                setHeaderExtra,
                onLogout: handleLogout,
              }}
            />
          </div>
        </main>
        <MobileNav isStaff={isStaff} />
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
