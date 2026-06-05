import type { ReactNode } from 'react'

type CategoryStyle = {
  bg: string
  badge: string
  icon: ReactNode
}

const defaultIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 21l8.913-6.247m-8.913 0L3 13.5 18.75 3 15 21l-5.187-5.096z"
    />
  </svg>
)

const categoryStyles: Record<string, CategoryStyle> = {
  Trabajo: {
    bg: 'bg-indigo-50 text-indigo-600',
    badge: 'bg-indigo-50/70 text-indigo-700 border-indigo-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15m16.5 0c0-1.242-1.008-2.25-2.25-2.25H6c-1.242 0-2.25 1.008-2.25 2.25m16.5 0V8.625c0-.621-.504-1.125-1.125-1.125h-2.625V4.875A1.125 1.125 0 0015 3.75H9a1.125 1.125 0 00-1.125 1.125v2.625H5.25A1.125 1.125 0 004.125 8.625v5.525"
        />
      </svg>
    ),
  },
  Negocio: {
    bg: 'bg-emerald-50 text-emerald-600',
    badge: 'bg-emerald-50/70 text-emerald-700 border-emerald-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z"
        />
      </svg>
    ),
  },
  Alimentación: {
    bg: 'bg-rose-50 text-rose-600',
    badge: 'bg-rose-50/70 text-rose-700 border-rose-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    ),
  },
  Servicios: {
    bg: 'bg-violet-50 text-violet-600',
    badge: 'bg-violet-50/70 text-violet-700 border-violet-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  Transporte: {
    bg: 'bg-amber-50 text-amber-600',
    badge: 'bg-amber-50/70 text-amber-700 border-amber-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.847-13.56A1.875 1.875 0 0018.785 3H5.215a1.875 1.875 0 00-1.833 1.616L2.535 18.176c-.039.62.469 1.124 1.09 1.124H5.25M16.5 18.75h-9"
        />
      </svg>
    ),
  },
  Salud: {
    bg: 'bg-rose-50 text-rose-600',
    badge: 'bg-rose-50/70 text-rose-700 border-rose-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0 7.5 7.5 0 00-15 0z" />
      </svg>
    ),
  },
  Educación: {
    bg: 'bg-sky-50 text-sky-600',
    badge: 'bg-sky-50/70 text-sky-700 border-sky-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  Entretenimiento: {
    bg: 'bg-purple-50 text-purple-600',
    badge: 'bg-purple-50/70 text-purple-700 border-purple-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 21l8.913-6.247m-8.913 0L3 13.5 18.75 3 15 21l-5.187-5.096z"
        />
      </svg>
    ),
  },
  Inversiones: {
    bg: 'bg-emerald-50 text-emerald-600',
    badge: 'bg-emerald-50/70 text-emerald-700 border-emerald-100',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9.75 12 2.25 6v4.5L12 12 2.25 15V18z" />
      </svg>
    ),
  },
}

export function getCategoryDisplay(categoria: string): CategoryStyle {
  return (
    categoryStyles[categoria] ?? {
      bg: 'bg-slate-50 text-slate-600',
      badge: 'bg-slate-50/70 text-slate-700 border-slate-100',
      icon: defaultIcon,
    }
  )
}
