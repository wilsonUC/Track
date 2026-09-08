import { AlertTriangle, ArrowLeft, Clock, RotateCw, ShieldAlert, ShieldX, UserX } from 'lucide-react'
import { useState } from 'react'

export type AccessDeniedReason = 'blocked' | 'expired' | 'pending' | 'generic'

interface AccessDeniedCardProps {
  reason?: AccessDeniedReason
  customMessage?: string
  username?: string
  onRetry?: () => Promise<void> | void
  onBackToLogin: () => void
}

export function AccessDeniedCard({
  reason = 'generic',
  customMessage,
  username,
  onRetry,
  onBackToLogin,
}: AccessDeniedCardProps) {
  const [retrying, setRetrying] = useState(false)

  async function handleRetry() {
    if (!onRetry) return
    setRetrying(true)
    try {
      await onRetry()
    } finally {
      setRetrying(false)
    }
  }

  const config = {
    blocked: {
      badge: 'CUENTA BLOQUEADA',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
      title: 'Acceso Denegado',
      subtitle: 'Tu acceso a la aplicación ha sido suspendido o revocado por el administrador.',
      hint: 'Si consideras que se trata de un error, comunícate con el administrador para solicitar la reactivación de tu cuenta.',
      Icon: ShieldX,
      iconColor: 'text-rose-600',
      iconBg: 'bg-gradient-to-br from-rose-50 via-rose-100/60 to-red-100/80',
      iconRing: 'ring-rose-200/70',
      glowColor: 'shadow-rose-500/20',
    },
    expired: {
      badge: 'PERIODO EXPIRADO',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/10',
      title: 'Periodo de Acceso Vencido',
      subtitle: 'Tu tiempo de vigencia o suscripción en la plataforma ha finalizado.',
      hint: 'Por favor contacta al administrador para renovar tu periodo de acceso y continuar disfrutando de todas las funciones.',
      Icon: Clock,
      iconColor: 'text-rose-600',
      iconBg: 'bg-gradient-to-br from-rose-50 via-red-50 to-amber-50',
      iconRing: 'ring-rose-200/70',
      glowColor: 'shadow-rose-500/20',
    },
    pending: {
      badge: 'PENDIENTE DE ACTIVACIÓN',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',
      title: 'Cuenta en Espera',
      subtitle: 'Tu cuenta ha sido registrada con éxito y se encuentra en proceso de revisión.',
      hint: 'El administrador debe habilitar tu cuenta antes de que puedas ingresar. Te notificaremos una vez sea aprobada.',
      Icon: AlertTriangle,
      iconColor: 'text-blue-600',
      iconBg: 'bg-gradient-to-br from-blue-50 to-indigo-100/60',
      iconRing: 'ring-blue-200/70',
      glowColor: 'shadow-blue-500/20',
    },
    generic: {
      badge: 'ACCESO RESTRINGIDO',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
      title: 'Acceso Denegado',
      subtitle: 'Tu acceso a la aplicación ha sido revocado o ha expirado.',
      hint: 'Si crees que esto es un error, por favor contacta al administrador para solicitar acceso nuevamente.',
      Icon: ShieldAlert,
      iconColor: 'text-rose-600',
      iconBg: 'bg-gradient-to-br from-rose-50 via-rose-100/60 to-red-100/80',
      iconRing: 'ring-rose-200/70',
      glowColor: 'shadow-rose-500/20',
    },
  }[reason]

  const ActiveIcon = config.Icon

  return (
    <div className="mx-auto w-full max-w-md animate-[fadeIn_0.35s_ease-out]">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-300/40 backdrop-blur-md sm:p-8">
        {/* Subtle Decorative Ambient Background Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-500/5 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl"
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Main Shield Icon with Premium Multi-Layered Glow */}
          <div className="relative mb-5 flex items-center justify-center">
            {/* Outer Pulse Wave */}
            <div
              className={`absolute -inset-2 rounded-full ${config.glowColor} animate-pulse bg-rose-400/20 blur-md`}
            />

            {/* Inner Icon Container */}
            <div
              className={`relative flex h-20 w-20 items-center justify-center rounded-full ${config.iconBg} ring-8 ${config.iconRing} shadow-lg transition-transform duration-300 hover:scale-105`}
            >
              <ActiveIcon className={`h-10 w-10 ${config.iconColor} stroke-[2.2] drop-shadow-sm`} />
            </div>
          </div>

          {/* Status Pill Badge */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider ring-1 shadow-xs ${config.badgeClass}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {config.badge}
          </div>

          {/* Title */}
          <h2 className="mt-4 text-2xl font-black tracking-tight text-[#0f2d6e] sm:text-[26px]">
            {config.title}
          </h2>

          {/* Primary Subtitle */}
          <p className="mt-2.5 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
            {config.subtitle}
          </p>

          {/* Username tag if present */}
          {username && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-1 text-xs font-semibold text-slate-700">
              <UserX className="h-3.5 w-3.5 text-slate-500" />
              <span>Usuario: {username}</span>
            </div>
          )}

          {/* Detailed Message Box / Hint */}
          <div className="mt-4 w-full rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-left shadow-xs">
            <p className="text-xs leading-relaxed text-slate-600 sm:text-[13px]">
              {customMessage || config.hint}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 w-full space-y-3">
            {onRetry && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-bold tracking-wide text-slate-700 shadow-sm transition hover:border-[#0f2d6e] hover:bg-slate-50 hover:text-[#0f2d6e] focus:outline-none focus:ring-2 focus:ring-[#0f2d6e]/20 disabled:opacity-60"
              >
                <RotateCw
                  className={`h-4 w-4 text-slate-500 transition-transform group-hover:rotate-180 group-hover:text-[#0f2d6e] ${
                    retrying ? 'animate-spin text-[#0f2d6e]' : ''
                  }`}
                />
                {retrying ? 'Verificando acceso…' : 'Verificar acceso nuevamente'}
              </button>
            )}

            <button
              type="button"
              onClick={onBackToLogin}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f2d6e] py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#0f2d6e]/25 transition hover:bg-[#1a3d7c] focus:outline-none focus:ring-2 focus:ring-[#0f2d6e]/30"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Ingresar con otra cuenta</span>
            </button>
          </div>

          {/* Security Subtext */}
          <p className="mt-5 text-[10px] font-bold tracking-[0.2em] text-slate-400">
            SISTEMA DE SEGURIDAD FINANZAS TRACK
          </p>
        </div>
      </div>
    </div>
  )
}
