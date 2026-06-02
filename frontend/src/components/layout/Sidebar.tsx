import { NavLink } from 'react-router-dom'
import { menuItems } from '../../constants/navigation'
import { sectionPaths } from '../../constants/routes'
import type { Section } from '../../types/finance'
import { NavIcon } from './navIcons'

type SidebarProps = {
  onLogout: () => void
}

function navClassName(isActive: boolean) {
  return `group flex w-full min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
    isActive ? 'bg-indigo-500 font-semibold text-white' : 'text-indigo-100 hover:bg-indigo-600'
  }`
}

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-indigo-700 p-4 text-indigo-50 md:flex md:min-h-screen">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
              G
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">GrLaz</p>
              <p className="truncate text-xs text-indigo-200">gr.laz@hotmail.com</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 w-full rounded-lg border border-indigo-500/80 px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-indigo-600"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
