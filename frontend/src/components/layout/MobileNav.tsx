import { menuItems } from '../../constants/navigation'
import type { Section } from '../../types/finance'
import { NavIcon } from './navIcons'

type MobileNavProps = {
  section: Section
  onNavigate: (section: Section) => void
}

export function MobileNav({ section, onNavigate }: MobileNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white py-2 shadow-sm md:hidden"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}
      aria-label="Navegación principal"
    >
      <div className="flex gap-1 overflow-x-auto px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {menuItems.map((item) => {
          const active = section === item.id
          const label = item.shortLabel ?? item.label
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex min-w-[4.25rem] max-w-[5.75rem] shrink-0 flex-col items-center gap-0.5 rounded-lg px-1.5 py-2 text-[10px] font-medium leading-tight transition ${
                active ? 'bg-indigo-100 font-semibold text-indigo-900' : 'text-slate-500 active:bg-slate-100'
              }`}
            >
              <span className={active ? 'text-indigo-600' : 'text-slate-400'}>
                <NavIcon section={item.id} />
              </span>
              <span className="line-clamp-2 w-full text-center">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
