import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Target,
  RefreshCcw,
  FileBarChart,
  Lightbulb,
  Sparkles,
  Settings,
} from 'lucide-react'
import type { Section } from '../../types/finance'

const iconClass = 'h-5 w-5 shrink-0'

export function NavIcon({ section }: { section: Section }) {
  switch (section) {
    case 'dashboard':
      return <LayoutDashboard className={iconClass} aria-hidden />
    case 'ingresos':
      return <TrendingUp className={iconClass} aria-hidden />
    case 'gastos':
      return <TrendingDown className={iconClass} aria-hidden />
    case 'presupuestos':
      return <CreditCard className={iconClass} aria-hidden />
    case 'metas':
      return <Target className={iconClass} aria-hidden />
    case 'recurrentes':
      return <RefreshCcw className={iconClass} aria-hidden />
    case 'reportes':
      return <FileBarChart className={iconClass} aria-hidden />
    case 'consejos':
      return <Lightbulb className={iconClass} aria-hidden />
    case 'ia':
      return <Sparkles className={iconClass} aria-hidden />
    case 'configuracion':
      return <Settings className={iconClass} aria-hidden />
  }
}
