import { NavLink } from 'react-router-dom'
import { menuItems } from '../../constants/navigation'
import { sectionPaths } from '../../constants/routes'
import type { Section } from '../../types/finance'
import { NavIcon } from './navIcons'

type MobileNavProps = {
  isStaff: boolean
}

export function MobileNav({ isStaff }: MobileNavProps) {
  const visibleMenuItems = menuItems.filter((item) => !item.adminOnly || isStaff)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white py-2 shadow-sm md:hidden"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}
      aria-label="Navegación principal"
    >
      <div className="flex gap-1 overflow-x-auto px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleMenuItems.map((item) => {
          const label = item.shortLabel ?? item.label
          return (
            <NavLink
              key={item.id}
              to={sectionPaths[item.id as Section]}
              end={item.id === 'dashboard'}
              className={({ isActive }) =>
                `flex min-w-[4.25rem] max-w-[5.75rem] shrink-0 flex-col items-center gap-0.5 rounded-lg px-1.5 py-2 text-[10px] font-medium leading-tight transition ${
                  isActive ? 'bg-indigo-100 font-semibold text-indigo-900' : 'text-slate-500 active:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
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
