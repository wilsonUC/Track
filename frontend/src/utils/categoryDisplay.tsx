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
  bg: 'bg-slate-50 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
  badge:
    'bg-slate-50/70 text-slate-700 border-slate-100 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/25',
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
    bg: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
    badge:
      'bg-orange-50/70 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/25',
    bar: 'bg-orange-500',
    icon: Home,
  },
  Alimentación: {
    bg: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    badge:
      'bg-rose-50/70 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25',
    bar: 'bg-rose-500',
    icon: UtensilsCrossed,
  },
  Transporte: {
    bg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    badge:
      'bg-amber-50/70 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25',
    bar: 'bg-amber-500',
    icon: Car,
  },
  Servicios: {
    bg: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    badge:
      'bg-violet-50/70 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/25',
    bar: 'bg-violet-500',
    icon: Zap,
  },
  Salud: {
    bg: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    badge:
      'bg-rose-50/70 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25',
    bar: 'bg-rose-500',
    icon: HeartPulse,
  },
  Educación: {
    bg: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    badge:
      'bg-sky-50/70 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25',
    bar: 'bg-sky-500',
    icon: BookOpen,
  },
  Entretenimiento: {
    bg: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
    badge:
      'bg-purple-50/70 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/25',
    bar: 'bg-purple-500',
    icon: Sparkles,
  },
  Negocio: {
    bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    badge:
      'bg-emerald-50/70 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25',
    bar: 'bg-emerald-500',
    icon: Store,
  },
  // Ingresos
  Trabajo: {
    bg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    badge:
      'bg-indigo-50/70 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/25',
    bar: 'bg-indigo-500',
    icon: Briefcase,
  },
  Comisiones: {
    bg: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
    badge:
      'bg-cyan-50/70 text-cyan-700 border-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/25',
    bar: 'bg-cyan-500',
    icon: BadgePercent,
  },
  Inversiones: {
    bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    badge:
      'bg-emerald-50/70 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25',
    bar: 'bg-emerald-500',
    icon: LineChart,
  },
  Regalos: {
    bg: 'bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',
    badge:
      'bg-pink-50/70 text-pink-700 border-pink-100 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/25',
    bar: 'bg-pink-500',
    icon: Gift,
  },
  Reembolsos: {
    bg: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400',
    badge:
      'bg-teal-50/70 text-teal-700 border-teal-100 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/25',
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
