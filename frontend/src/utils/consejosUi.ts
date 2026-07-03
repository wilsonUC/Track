import {
  BookOpen,
  CheckCircle,
  Lightbulb,
  ShieldAlert,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import type { ConsejoCategoria } from '../api/consejos'

type ConsejoVisual = {
  icono: LucideIcon
  colorIcono: string
  bgIcono: string
}

export function getConsejoVisual(categoria: ConsejoCategoria): ConsejoVisual {
  switch (categoria) {
    case 'ALERTA':
      return {
        icono: ShieldAlert,
        colorIcono: 'text-rose-500',
        bgIcono: 'bg-rose-50 border-rose-100',
      }
    case 'AHORRO':
      return {
        icono: CheckCircle,
        colorIcono: 'text-emerald-500',
        bgIcono: 'bg-emerald-50 border-emerald-100',
      }
    case 'INVERSIÓN':
      return {
        icono: TrendingUp,
        colorIcono: 'text-violet-500',
        bgIcono: 'bg-violet-50 border-violet-100',
      }
    case 'GENERAL':
    default:
      return {
        icono: BookOpen,
        colorIcono: 'text-indigo-600',
        bgIcono: 'bg-indigo-50 border-indigo-100',
      }
  }
}

export function formatConsejosFecha(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function consejoImpactoClass(impacto: string): string {
  if (impacto === 'ALTO') {
    return 'bg-rose-50 text-rose-600 border border-rose-100'
  }
  if (impacto === 'OPTIMISTA') {
    return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
  }
  return 'bg-amber-50 text-amber-600 border border-amber-100'
}

export { Lightbulb }
