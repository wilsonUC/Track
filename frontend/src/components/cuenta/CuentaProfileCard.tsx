import { Camera, Mail, Phone, Shield, User } from 'lucide-react'
import { profileFullName, type UserProfile } from '../../api/auth'

type CuentaProfileCardProps = {
  profile: UserProfile
}

export function CuentaProfileCard({ profile }: CuentaProfileCardProps) {
  const fullName = profileFullName(profile)

  return (
    <article className="mx-auto w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-slate-200/80">
      {/* Cabecera azul */}
      <div className="h-28 bg-[#2563eb]" aria-hidden />

      {/* Cuerpo */}
      <div className="px-6 pb-7 pt-0">
        {/* Avatar superpuesto */}
        <div className="relative -mt-14 flex justify-center">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-[5px] border-white bg-[#dbeafe] shadow-sm">
              <User className="h-14 w-14 stroke-[1.25] text-[#1d4ed8]" aria-hidden />
            </div>
            <button
              type="button"
              disabled
              title="Foto de perfil próximamente"
              className="absolute bottom-1 right-0 flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-xl bg-[#14b8a6] text-white shadow-md opacity-90"
              aria-label="Cambiar foto de perfil (próximamente)"
            >
              <Camera className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Identidad */}
        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold tracking-tight text-[#1e3a8a]">{fullName}</h2>
          <p className="mt-0.5 text-sm font-medium text-slate-400">@{profile.username}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-[#1d4ed8]">
            <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
            USUARIO
          </span>
        </div>

        {/* Separador */}
        <div className="mx-1 mt-6 border-t border-slate-100" />

        {/* Contacto */}
        <ul className="mt-5 space-y-4">
          <li className="flex items-center gap-3">
            <Mail className="h-[18px] w-[18px] shrink-0 stroke-[1.5] text-slate-400" aria-hidden />
            <span className="min-w-0 truncate text-sm font-medium text-slate-600">
              {profile.email || '—'}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Phone className="h-[18px] w-[18px] shrink-0 stroke-[1.5] text-slate-400" aria-hidden />
            <span className="text-sm font-medium text-slate-600">{profile.telefono || '—'}</span>
          </li>
          <li className="flex items-center gap-3">
            <User className="h-[18px] w-[18px] shrink-0 stroke-[1.5] text-slate-400" aria-hidden />
            <span className="min-w-0 truncate text-sm font-medium text-slate-600">
              Usuario: {profile.username}
            </span>
          </li>
        </ul>
      </div>
    </article>
  )
}
