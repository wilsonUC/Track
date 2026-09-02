import type { Section } from '../types/finance'

export type MenuItem = {
  id: Section
  /** Texto en sidebar y cabecera (escritorio) */
  label: string
  /** Texto corto en barra inferior móvil */
  shortLabel?: string
  /** Solo visible para usuarios administradores */
  adminOnly?: boolean
  /** Solo visible para cuentas avanzadas o administradores */
  advancedOnly?: boolean
  /** Visible, pero sin navegación por ahora */
  disabled?: boolean
}

export const menuItems: readonly MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Inicio' },
  { id: 'ingresos', label: 'Ingresos' },
  { id: 'gastos', label: 'Gastos' },
  { id: 'ahorros', label: 'Ahorros' },
  { id: 'presupuestos', label: 'Presupuestos', shortLabel: 'Presup.' },
  { id: 'metas', label: 'Metas', advancedOnly: true },
  { id: 'recurrentes', label: 'Recurrentes', shortLabel: 'Recurr.', advancedOnly: true },
  { id: 'reportes', label: 'Reportes' },
  { id: 'consejos', label: 'Consejos', advancedOnly: true },
  { id: 'ia', label: 'IA de FinanzasTrack', shortLabel: 'IA' },
  { id: 'admin', label: 'Administración', shortLabel: 'Admin', adminOnly: true },
  { id: 'configuracion', label: 'Configuración', shortLabel: 'Ajustes' },
]
