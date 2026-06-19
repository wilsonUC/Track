import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
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
  const [profile, setProfile] = useState<UserProfile | null>(null)

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

  return (
    <div className="h-dvh overflow-hidden bg-slate-100 text-slate-900">
      <Sidebar
        onLogout={handleLogout}
        displayName={displayName}
        email={userEmail}
        initial={userInitial}
      />

      <div className="flex h-full min-h-0 flex-col md:pl-64">
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-24 pt-5 md:px-8 md:pb-8 md:pt-8">
          <div className="mx-auto max-w-6xl">
            <MainHeader
              section={section}
              displayName={displayName}
              onOpenNewTransaction={handleOpenNewTransaction}
            />
            <Outlet
              context={{
                transactionsVersion,
                bumpTransactions: () => setTransactionsVersion((v) => v + 1),
                refreshProfile,
              }}
            />
          </div>
        </main>
        <MobileNav />
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
  )
}
