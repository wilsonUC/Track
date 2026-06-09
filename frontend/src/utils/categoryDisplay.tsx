import type { LucideIcon } from 'lucide-react'
import {
  BadgePercent,
  BookOpen,
  Briefcase,
  Car,
  Gift,
  HeartPulse,
  Home,
  LineChart,
  RotateCcw,
  Sparkles,
  Store,
  Tag,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'
import { createElement } from 'react'

type CategoryStyle = {
  bg: string
  badge: string
  bar: string
  icon: LucideIcon
}

const ICON_CLASS = 'h-5 w-5'

/** Otros y Otros ingresos (y cualquier nombre no listado) usan este estilo. */
const defaultStyle: CategoryStyle = {
  bg: 'bg-slate-50 text-slate-600',
  badge: 'bg-slate-50/70 text-slate-700 border-slate-100',
  bar: 'bg-slate-500',
  icon: Tag,
}

/**
 * Iconos y colores por nombre de categoría (debe coincidir con la BD).
 * Negocio aplica igual para gasto e ingreso (mismo nombre).
 */
const categoryStyles: Record<string, CategoryStyle> = {
  // Gastos
  Hogar: {
    bg: 'bg-orange-50 text-orange-600',
    badge: 'bg-orange-50/70 text-orange-700 border-orange-100',
    bar: 'bg-orange-500',
    icon: Home,
  },
  Alimentación: {
    bg: 'bg-rose-50 text-rose-600',
    badge: 'bg-rose-50/70 text-rose-700 border-rose-100',
    bar: 'bg-rose-500',
    icon: UtensilsCrossed,
  },
  Transporte: {
    bg: 'bg-amber-50 text-amber-600',
    badge: 'bg-amber-50/70 text-amber-700 border-amber-100',
    bar: 'bg-amber-500',
    icon: Car,
  },
  Servicios: {
    bg: 'bg-violet-50 text-violet-600',
    badge: 'bg-violet-50/70 text-violet-700 border-violet-100',
    bar: 'bg-violet-500',
    icon: Zap,
  },
  Salud: {
    bg: 'bg-rose-50 text-rose-600',
    badge: 'bg-rose-50/70 text-rose-700 border-rose-100',
    bar: 'bg-rose-500',
    icon: HeartPulse,
  },
  Educación: {
    bg: 'bg-sky-50 text-sky-600',
    badge: 'bg-sky-50/70 text-sky-700 border-sky-100',
    bar: 'bg-sky-500',
    icon: BookOpen,
  },
  Entretenimiento: {
    bg: 'bg-purple-50 text-purple-600',
    badge: 'bg-purple-50/70 text-purple-700 border-purple-100',
    bar: 'bg-purple-500',
    icon: Sparkles,
  },
  Negocio: {
    bg: 'bg-emerald-50 text-emerald-600',
    badge: 'bg-emerald-50/70 text-emerald-700 border-emerald-100',
    bar: 'bg-emerald-500',
    icon: Store,
  },
  // Ingresos
  Trabajo: {
    bg: 'bg-indigo-50 text-indigo-600',
    badge: 'bg-indigo-50/70 text-indigo-700 border-indigo-100',
    bar: 'bg-indigo-500',
    icon: Briefcase,
  },
  Comisiones: {
    bg: 'bg-cyan-50 text-cyan-600',
    badge: 'bg-cyan-50/70 text-cyan-700 border-cyan-100',
    bar: 'bg-cyan-500',
    icon: BadgePercent,
  },
  Inversiones: {
    bg: 'bg-emerald-50 text-emerald-600',
    badge: 'bg-emerald-50/70 text-emerald-700 border-emerald-100',
    bar: 'bg-emerald-500',
    icon: LineChart,
  },
  Regalos: {
    bg: 'bg-pink-50 text-pink-600',
    badge: 'bg-pink-50/70 text-pink-700 border-pink-100',
    bar: 'bg-pink-500',
    icon: Gift,
  },
  Reembolsos: {
    bg: 'bg-teal-50 text-teal-600',
    badge: 'bg-teal-50/70 text-teal-700 border-teal-100',
    bar: 'bg-teal-500',
    icon: RotateCcw,
  },
}

function resolveCategoryStyle(categoria: string): CategoryStyle {
  return categoryStyles[categoria] ?? defaultStyle
}

export function getCategoryDisplay(categoria: string) {
  const style = resolveCategoryStyle(categoria)
  return {
    bg: style.bg,
    badge: style.badge,
    icon: createElement(style.icon, { className: ICON_CLASS, 'aria-hidden': true }),
  }
}

/** Colores para barras de progreso (gastos por categoría). */
export function getCategoryChartColors(categoria: string) {
  const style = resolveCategoryStyle(categoria)
  return {
    colorBg: style.bar,
    colorLight: style.badge,
  }
}
