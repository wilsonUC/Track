import { LogOut, CircleDollarSign } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { menuItems } from '../../constants/navigation'
import { sectionPaths } from '../../constants/routes'
import type { Section } from '../../types/finance'
import { NavIcon } from './navIcons'

type SidebarProps = {
  onLogout: () => void
  displayName: string
  email: string
  initial: string
}

function navClassName(isActive: boolean) {
  return `group flex w-full min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
    isActive ? 'bg-indigo-500 font-semibold text-white' : 'text-indigo-100 hover:bg-indigo-600'
  }`
}

export function Sidebar({ onLogout, displayName, email, initial }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col bg-indigo-700 p-4 text-indigo-50 md:flex">
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <CircleDollarSign className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold leading-snug tracking-tight text-white">FinanzasTrack</div>
              <p className="text-xs text-indigo-200">Panel principal</p>
            </div>
          </div>
        </div>

        <nav className="mt-8 min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-0.5" aria-label="Secciones">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={sectionPaths[item.id as Section]}
              end={item.id === 'dashboard'}
              className={({ isActive }) => navClassName(isActive)}
            >
              {({ isActive }) => (
                <>
                  <span className={`shrink-0 ${isActive ? 'text-white' : 'text-indigo-200 group-hover:text-indigo-50'}`}>
                    <NavIcon section={item.id} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 shrink-0 rounded-lg border border-indigo-600/80 bg-indigo-800/40 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-xs text-indigo-200">{email || '—'}</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/80 px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-indigo-600"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
