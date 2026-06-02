import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { logout } from '../api/auth'
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

  function handleOpenNewTransaction() {
    setMovementType(defaultMovementType(pathname))
    setShowModal(true)
  }

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen items-stretch">
        <Sidebar onLogout={handleLogout} />

        <div className="flex min-h-screen flex-1 flex-col">
          <main className="flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-8 md:pt-8">
            <div className="mx-auto max-w-6xl">
              <MainHeader section={section} onOpenNewTransaction={handleOpenNewTransaction} />
              <Outlet context={{ transactionsVersion }} />
            </div>
          </main>
          <MobileNav />
        </div>
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
