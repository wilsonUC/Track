import { Activity, ShieldCheck, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import brandLogo from '../../assets/brand/v4.svg'

type AuthBrandingPanelProps = {
  tagline: string
}

export function AuthBrandingPanel({ tagline }: AuthBrandingPanelProps) {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-b from-[#1d4ed8] via-[#1e40af] to-[#0f172a] p-10 text-white md:flex md:min-h-[640px] md:w-[42%] md:shrink-0 lg:p-12">
      <div>
        <div className="flex items-center gap-3.5">
          <img src={brandLogo} alt="FinanzasTrack Logo" className="h-11 w-11 shrink-0 object-contain drop-shadow-md" />
          <div>
            <p className="text-xl font-bold leading-tight tracking-tight text-white">FinanzasTrack</p>
            <div className="mt-1 h-1 w-12 rounded-full bg-[#2dd4bf]" aria-hidden />
          </div>
        </div>
        <p className="mt-6 max-w-xs text-sm leading-relaxed text-blue-100/90">{tagline}</p>
      </div>

      {/* Animated Financial Growth Chart */}
      <div className="my-auto flex flex-col items-center justify-center py-1">
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1.5 backdrop-blur-md shadow-lg shadow-emerald-900/30 animate-[growUp_1.6s_ease-out_forwards]">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-[#0f172a] shadow-md">
            <TrendingUp className="h-3.5 w-3.5 stroke-[3]" />
          </div>
          <span className="text-xs font-black tracking-wide text-emerald-300">+38.5% Crecimiento</span>
        </div>

        <div className="relative mt-3 w-full max-w-[290px]">
          <svg viewBox="0 0 280 170" className="w-full overflow-visible">
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="45%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Gradient Fill area */}
            <path
              d="M 10,160 C 60,155 110,135 150,95 C 190,55 230,25 268,12 L 268,165 L 10,165 Z"
              fill="url(#growthGrad)"
              className="animate-[growUp_2.2s_ease-out_forwards]"
            />

            {/* Steep rising stroke line */}
            <path
              d="M 10,160 C 60,155 110,135 150,95 C 190,55 230,25 268,12"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: 320,
                strokeDashoffset: 0,
                animation: 'drawLine 3.2s ease-in-out forwards',
              }}
            />

            {/* Solid green tip dot with expanding pulse wave */}
            <g className="animate-move-tip">
              <circle
                cx="0"
                cy="0"
                r="6.5"
                fill="#10b981"
                className="shadow-lg"
              />
              <circle
                cx="0"
                cy="0"
                r="12"
                fill="#10b981"
                fillOpacity="0.35"
                className="animate-ping"
              />
            </g>
          </svg>
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/10 p-4.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <p className="text-[10px] font-bold tracking-widest text-emerald-300">ESTADO DEL SISTEMA</p>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold tracking-wider text-emerald-300">
            EN LÍNEA
          </span>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/10 p-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="text-[11px] font-semibold text-white">Cifrado AES-256</span>
            </div>
            <p className="mt-1 text-[10px] text-blue-200/80">Protección activa</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 p-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 shrink-0 text-teal-300" />
              <span className="text-[11px] font-semibold text-white">Servidor 24/7</span>
            </div>
            <p className="mt-1 text-[10px] text-blue-200/80">Disponibilidad 99.9%</p>
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
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#e8edf5] p-3.5 sm:p-6">
      <div className="relative flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-300/50">
        {accent === 'register' && (
          <div className="absolute bottom-0 right-0 top-0 w-1.5 bg-[#2563eb]" aria-hidden />
        )}
        <AuthBrandingPanel tagline={tagline} />
        <div className="flex flex-1 flex-col justify-center px-5 py-6 sm:px-10 md:px-12 lg:px-14">
          {children}
        </div>
      </div>
    </div>
  )
}
