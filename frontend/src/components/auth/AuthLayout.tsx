import { CircleDollarSign } from 'lucide-react'
import type { ReactNode } from 'react'

type AuthBrandingPanelProps = {
  tagline: string
}

export function AuthBrandingPanel({ tagline }: AuthBrandingPanelProps) {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-b from-[#1d4ed8] via-[#1e40af] to-[#0f172a] p-10 text-white md:flex md:min-h-[640px] md:w-[42%] md:shrink-0 lg:p-12">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <CircleDollarSign className="h-6 w-6 text-white" aria-hidden />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight tracking-tight">FinanzasTrack</p>
            <div className="mt-1 h-1 w-10 rounded-full bg-[#2dd4bf]" aria-hidden />
          </div>
        </div>
        <p className="mt-8 max-w-xs text-sm leading-relaxed text-blue-100/90">{tagline}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-widest text-blue-100/80">ESTADO DEL SISTEMA</p>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['U1', 'U2', 'U3'].map((label) => (
              <div
                key={label}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1e40af] bg-[#3b82f6] text-[10px] font-bold text-white"
              >
                {label}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">+24 actualizaciones</p>
            <p className="text-xs text-blue-200/80">Activas hoy</p>
          </div>
        </div>
      </div>
    </div>
  )
}

type AuthSplitCardProps = {
  tagline: string
  children: ReactNode
  accent?: 'login' | 'register'
}

export function AuthSplitCard({ tagline, children, accent = 'login' }: AuthSplitCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e8edf5] px-4 py-8">
      <div className="relative flex w-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-white shadow-2xl shadow-slate-300/50">
        {accent === 'register' && (
          <div className="absolute bottom-0 right-0 top-0 w-1.5 bg-[#2563eb]" aria-hidden />
        )}
        <AuthBrandingPanel tagline={tagline} />
        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 md:px-12 lg:px-14">
          {children}
        </div>
      </div>
    </div>
  )
}
