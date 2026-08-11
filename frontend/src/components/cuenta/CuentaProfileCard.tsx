import { Camera, LogOut, Mail, Phone, Shield, User } from 'lucide-react'
import { profileFullName, type UserProfile } from '../../api/auth'

type CuentaProfileCardProps = {
  profile: UserProfile
  onLogout?: () => void
}

export function CuentaProfileCard({ profile, onLogout }: CuentaProfileCardProps) {
  const fullName = profileFullName(profile)

  return (
    <article className="mx-auto w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-slate-200/80 ring-1 ring-slate-100 dark:bg-slate-800 dark:shadow-none dark:ring-slate-700">
      <div className="h-28 bg-[#2563eb] dark:bg-slate-900" aria-hidden />

      <div className="px-6 pb-7 pt-0 dark:bg-slate-800">
        <div className="relative -mt-14 flex justify-center">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-[5px] border-white bg-[#dbeafe] shadow-sm dark:border-slate-800 dark:bg-slate-700 dark:shadow-none">
              <User className="h-14 w-14 stroke-[1.25] text-[#1d4ed8] dark:text-slate-300" aria-hidden />
            </div>
            <button
              type="button"
              disabled
              title="Foto de perfil próximamente"
              className="absolute bottom-1 right-0 flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-xl bg-[#14b8a6] text-white shadow-md opacity-90 dark:bg-teal-700 dark:shadow-none"
              aria-label="Cambiar foto de perfil (próximamente)"
            >
              <Camera className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold tracking-tight text-[#1e3a8a] dark:text-slate-100">
            {fullName}
          </h2>
          <p className="mt-0.5 text-sm font-medium text-slate-400 dark:text-slate-400">
            @{profile.username}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-[#1d4ed8] dark:bg-slate-700 dark:text-slate-200">
            <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
            USUARIO
          </span>
        </div>

        <div className="mx-1 mt-6 border-t border-slate-100 dark:border-slate-700" />

        <ul className="mt-5 space-y-4">
          <li className="flex items-center gap-3">
            <Mail className="h-[18px] w-[18px] shrink-0 stroke-[1.5] text-slate-400" aria-hidden />
            <span className="min-w-0 truncate text-sm font-medium text-slate-600 dark:text-slate-300">
              {profile.email || '—'}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Phone className="h-[18px] w-[18px] shrink-0 stroke-[1.5] text-slate-400" aria-hidden />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {profile.telefono || '—'}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <User className="h-[18px] w-[18px] shrink-0 stroke-[1.5] text-slate-400" aria-hidden />
            <span className="min-w-0 truncate text-sm font-medium text-slate-600 dark:text-slate-300">
              Usuario: {profile.username}
            </span>
          </li>
        </ul>

        {onLogout && (
          <div className="mt-6 pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/80 py-3 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-100 active:scale-95 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60"
            >
              <LogOut className="h-4 w-4 stroke-[2.25]" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
