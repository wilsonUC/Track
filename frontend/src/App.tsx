import { useState } from 'react'
import { getAccessToken, logout } from './api/auth'
import { LoginPage } from './page/LoginPage'
import { RegisterPage } from './page/RegisterPage'
import { DashboardPanel } from './components/dashboard/DashboardPanel'
import { MainHeader } from './components/layout/MainHeader'
import { MobileNav } from './components/layout/MobileNav'
import { PlaceholderPanel } from './components/layout/PlaceholderPanel'
import { Sidebar } from './components/layout/Sidebar'
import { NewTransactionModal } from './components/transactions/NewTransactionModal'
import { TransactionsPanel } from './components/transactions/TransactionsPanel'
import type { MovementType, Section } from './types/finance'

function isTransactionsSection(s: Section): s is 'ingresos' | 'gastos' {
  return s === 'ingresos' || s === 'gastos'
}

function isPlaceholderSection(s: Section): boolean {
  return s !== 'dashboard' && !isTransactionsSection(s)
}

function App() {
  const [section, setSection] = useState<Section>('dashboard')
  const [showModal, setShowModal] = useState(false)
  const [movementType, setMovementType] = useState<MovementType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('otros')
  const [date, setDate] = useState('2026-03-24')
  const [description, setDescription] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(() => getAccessToken() !== null)
  const [authView, setAuthView] = useState<'login' | 'register'>('login')
  const [authMessage, setAuthMessage] = useState('')

  function handleLogout(){
    logout()
    setIsLoggedIn(false)
    setAuthView('login')
    setAuthMessage("")
  }

  if (!isLoggedIn) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onGoLogin={() => setAuthView('login')}
          onRegistered={() => {
            setAuthView('login')
            setAuthMessage('Cuenta creada. Inicia sesión con tu usuario y contraseña.')
          }}
        />
      )
    }
    return (
      <LoginPage
        onSuccess={() => setIsLoggedIn(true)}
        onGoRegister={() => {
          setAuthMessage('')
          setAuthView('register')
        }}
        successMessage={authMessage}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen items-stretch">
        <Sidebar section={section} onNavigate={setSection} onLogout={handleLogout} />

        <div className="flex min-h-screen flex-1 flex-col">
          <main className="flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-8 md:pt-8">
            <div className="mx-auto max-w-6xl">
              <MainHeader section={section} onOpenNewTransaction={() => setShowModal(true)} />

              {section === 'dashboard' && <DashboardPanel />}

              {isTransactionsSection(section) && <TransactionsPanel section={section} />}

              {isPlaceholderSection(section) && <PlaceholderPanel section={section} />}
            </div>
          </main>
          <MobileNav section={section} onNavigate={setSection} />
        </div>
      </div>

      <NewTransactionModal
        open={showModal}
        onClose={() => setShowModal(false)}
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

export default App
