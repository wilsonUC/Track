import type { LucideIcon } from 'lucide-react'
import {
  Baby,
  BadgePercent,
  BookOpen,
  Briefcase,
  Car,
  Coffee,
  Dumbbell,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Laptop,
  LineChart,
  Music,
  PawPrint,
  PiggyBank,
  Plane,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Tv,
  UtensilsCrossed,
  Wrench,
  Zap,
} from 'lucide-react'
import { createElement } from 'react'

export type CategoryStyle = {
  bg: string
  badge: string
  bar: string
  icon: LucideIcon
}

const ICON_CLASS = 'h-5 w-5'

export type ColorConfig = {
  key: string
  name: string
  bg: string
  badge: string
  bar: string
  hex: string
}

export const CATEGORY_COLORS: Record<string, ColorConfig> = {
  rose: {
    key: 'rose',
    name: 'Rosa',
    bg: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    badge: 'bg-rose-50/70 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25',
    bar: 'bg-rose-500',
    hex: '#f43f5e',
  },
  orange: {
    key: 'orange',
    name: 'Naranja',
    bg: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
    badge: 'bg-orange-50/70 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/25',
    bar: 'bg-orange-500',
    hex: '#f97316',
  },
  amber: {
    key: 'amber',
    name: 'Ámbar',
    bg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    badge: 'bg-amber-50/70 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25',
    bar: 'bg-amber-500',
    hex: '#f59e0b',
  },
  emerald: {
    key: 'emerald',
    name: 'Esmeralda',
    bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    badge: 'bg-emerald-50/70 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25',
    bar: 'bg-emerald-500',
    hex: '#10b981',
  },
  teal: {
    key: 'teal',
    name: 'Verde azulado',
    bg: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400',
    badge: 'bg-teal-50/70 text-teal-700 border-teal-100 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/25',
    bar: 'bg-teal-500',
    hex: '#14b8a6',
  },
  cyan: {
    key: 'cyan',
    name: 'Cian',
    bg: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
    badge: 'bg-cyan-50/70 text-cyan-700 border-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/25',
    bar: 'bg-cyan-500',
    hex: '#06b6d4',
  },
  sky: {
    key: 'sky',
    name: 'Celeste',
    bg: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    badge: 'bg-sky-50/70 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25',
    bar: 'bg-sky-500',
    hex: '#0ea5e9',
  },
  indigo: {
    key: 'indigo',
    name: 'Índigo',
    bg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    badge: 'bg-indigo-50/70 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/25',
    bar: 'bg-indigo-500',
    hex: '#6366f1',
  },
  violet: {
    key: 'violet',
    name: 'Violeta',
    bg: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    badge: 'bg-violet-50/70 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/25',
    bar: 'bg-violet-500',
    hex: '#8b5cf6',
  },
  purple: {
    key: 'purple',
    name: 'Púrpura',
    bg: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
    badge: 'bg-purple-50/70 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/25',
    bar: 'bg-purple-500',
    hex: '#a855f7',
  },
  pink: {
    key: 'pink',
    name: 'Fucsia',
    bg: 'bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',
    badge: 'bg-pink-50/70 text-pink-700 border-pink-100 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/25',
    bar: 'bg-pink-500',
    hex: '#ec4899',
  },
  slate: {
    key: 'slate',
    name: 'Pizarra',
    bg: 'bg-slate-50 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
    badge: 'bg-slate-50/70 text-slate-700 border-slate-100 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/25',
    bar: 'bg-slate-500',
    hex: '#64748b',
  },
}

export const CATEGORY_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  utensils: { label: 'Comida / Restaurantes', icon: UtensilsCrossed },
  car: { label: 'Transporte / Auto', icon: Car },
  home: { label: 'Hogar / Casa', icon: Home },
  zap: { label: 'Servicios / Luz / Agua', icon: Zap },
  heart: { label: 'Salud / Farmacia', icon: HeartPulse },
  book: { label: 'Educación / Libros', icon: BookOpen },
  sparkles: { label: 'Entretenimiento', icon: Sparkles },
  store: { label: 'Negocio / Comercio', icon: Store },
  briefcase: { label: 'Trabajo / Empleo', icon: Briefcase },
  'badge-percent': { label: 'Comisiones / Descuentos', icon: BadgePercent },
  'line-chart': { label: 'Inversiones', icon: LineChart },
  gift: { label: 'Regalos / Donaciones', icon: Gift },
  'rotate-ccw': { label: 'Reembolsos', icon: RotateCcw },
  dumbbell: { label: 'Deporte / Gimnasio', icon: Dumbbell },
  'paw-print': { label: 'Mascotas / Veterinaria', icon: PawPrint },
  coffee: { label: 'Cafetería / Salidas', icon: Coffee },
  'shopping-bag': { label: 'Compras / Ropa', icon: ShoppingBag },
  gamepad: { label: 'Videojuegos / Ocio', icon: Gamepad2 },
  plane: { label: 'Viajes / Vacaciones', icon: Plane },
  fuel: { label: 'Combustible / Gasolina', icon: Fuel },
  'graduation-cap': { label: 'Estudios / Universidad', icon: GraduationCap },
  wrench: { label: 'Mantenimiento / Taller', icon: Wrench },
  baby: { label: 'Familia / Bebé', icon: Baby },
  music: { label: 'Música / Eventos', icon: Music },
  tv: { label: 'Streaming / Suscripciones', icon: Tv },
  laptop: { label: 'Tecnología / Freelance', icon: Laptop },
  landmark: { label: 'Bancos / Finanzas', icon: Landmark },
  'piggy-bank': { label: 'Ahorro / Alcancía', icon: PiggyBank },
  tag: { label: 'General / Varios', icon: Tag },
}

/** Estilo por defecto */
const defaultStyle: CategoryStyle = {
  bg: CATEGORY_COLORS.slate.bg,
  badge: CATEGORY_COLORS.slate.badge,
  bar: CATEGORY_COLORS.slate.bar,
  icon: Tag,
}

/**
 * Mapeo de estilos para las categorías del sistema por su nombre exacto.
 */
const systemCategoryStyles: Record<string, CategoryStyle> = {
  Hogar: { ...CATEGORY_COLORS.orange, icon: Home },
  Alimentación: { ...CATEGORY_COLORS.rose, icon: UtensilsCrossed },
  Transporte: { ...CATEGORY_COLORS.amber, icon: Car },
  Servicios: { ...CATEGORY_COLORS.violet, icon: Zap },
  Salud: { ...CATEGORY_COLORS.rose, icon: HeartPulse },
  Educación: { ...CATEGORY_COLORS.sky, icon: BookOpen },
  Entretenimiento: { ...CATEGORY_COLORS.purple, icon: Sparkles },
  Negocio: { ...CATEGORY_COLORS.emerald, icon: Store },
  Trabajo: { ...CATEGORY_COLORS.indigo, icon: Briefcase },
  Comisiones: { ...CATEGORY_COLORS.cyan, icon: BadgePercent },
  Inversiones: { ...CATEGORY_COLORS.emerald, icon: LineChart },
  Regalos: { ...CATEGORY_COLORS.pink, icon: Gift },
  Reembolsos: { ...CATEGORY_COLORS.teal, icon: RotateCcw },
}

const dynamicCategoryStyles = new Map<string, CategoryStyle>()

export function registerCategories(categories: { nombre: string; icono?: string; color?: string }[]) {
  for (const cat of categories) {
    if (cat.icono || cat.color) {
      const iconObj = cat.icono ? CATEGORY_ICONS[cat.icono] : null
      const colorObj = cat.color ? CATEGORY_COLORS[cat.color] : null
      const fallback = systemCategoryStyles[cat.nombre] ?? defaultStyle

      dynamicCategoryStyles.set(cat.nombre, {
        bg: colorObj?.bg ?? fallback.bg,
        badge: colorObj?.badge ?? fallback.badge,
        bar: colorObj?.bar ?? fallback.bar,
        icon: iconObj?.icon ?? fallback.icon,
      })
    }
  }
}

export function resolveCategoryStyle(
  categoria: string,
  customIcon?: string | null,
  customColor?: string | null,
): CategoryStyle {
  if (customIcon || customColor) {
    const iconObj = customIcon ? CATEGORY_ICONS[customIcon] : null
    const colorObj = customColor ? CATEGORY_COLORS[customColor] : null
    const fallback = systemCategoryStyles[categoria] ?? defaultStyle

    return {
      bg: colorObj?.bg ?? fallback.bg,
      badge: colorObj?.badge ?? fallback.badge,
      bar: colorObj?.bar ?? fallback.bar,
      icon: iconObj?.icon ?? fallback.icon,
    }
  }

  // Comprobar si hay estilo dinámico registrado para esta categoría personalizada
  const dynamic = dynamicCategoryStyles.get(categoria)
  if (dynamic) return dynamic

  return systemCategoryStyles[categoria] ?? defaultStyle
}

export function getCategoryDisplay(
  categoria: string,
  customIcon?: string | null,
  customColor?: string | null,
) {
  const style = resolveCategoryStyle(categoria, customIcon, customColor)
  return {
    bg: style.bg,
    badge: style.badge,
    icon: createElement(style.icon, { className: ICON_CLASS, 'aria-hidden': true }),
    rawIcon: style.icon,
  }
}

/** Colores para barras de progreso (gastos por categoría). */
export function getCategoryChartColors(
  categoria: string,
  customColor?: string | null,
) {
  const style = resolveCategoryStyle(categoria, undefined, customColor)
  return {
    colorBg: style.bar,
    colorLight: style.badge,
  }
}
