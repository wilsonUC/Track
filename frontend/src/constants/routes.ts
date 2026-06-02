import type { Section } from '../types/finance'

/** Ruta URL de cada sección del menú */
export const sectionPaths: Record<Section, string> = {
  dashboard: '/',
  ingresos: '/ingresos',
  gastos: '/gastos',
  presupuestos: '/presupuestos',
  metas: '/metas',
  recurrentes: '/recurrentes',
  reportes: '/reportes',
  consejos: '/consejos',
  ia: '/ia',
  configuracion: '/configuracion',
}

const pathToSection = Object.entries(sectionPaths) as [Section, string][]

export function sectionFromPath(pathname: string): Section {
  const match = pathToSection.find(([, path]) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`),
  )
  return match?.[0] ?? 'dashboard'
}
