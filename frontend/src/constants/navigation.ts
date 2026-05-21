import type { Section } from '../types/finance'

export type MenuItem = {
  id: Section
  /** Texto en sidebar y cabecera (escritorio) */
  label: string
  /** Texto corto en barra inferior móvil */
  shortLabel?: string
}

export const menuItems: readonly MenuItem[] = [
  { id: 'dashboard', label: 'Resumen', shortLabel: 'Inicio' },
  { id: 'ingresos', label: 'Ingresos' },
  { id: 'gastos', label: 'Gastos' },
  { id: 'presupuestos', label: 'Presupuestos', shortLabel: 'Presup.' },
  { id: 'metas', label: 'Metas' },
  { id: 'recurrentes', label: 'Recurrentes', shortLabel: 'Recurr.' },
  { id: 'reportes', label: 'Reportes' },
  { id: 'consejos', label: 'Consejos' },
  { id: 'ia', label: 'IA de FinanzasTrack', shortLabel: 'IA' },
  { id: 'configuracion', label: 'Configuración', shortLabel: 'Ajustes' },
]
