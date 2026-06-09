import type { Section } from '../types/finance'

export const sectionTitle: Record<Section, string> = {
  dashboard: 'Resumen',
  ingresos: 'Ingresos',
  gastos: 'Gastos',
  presupuestos: 'Presupuestos',
  metas: 'Metas',
  recurrentes: 'Recurrentes',
  reportes: 'Reportes',
  consejos: 'Consejos',
  ia: 'IA de FinanzasTrack',
  configuracion: 'Configuración',
}

export const sectionSubtitle: Record<Section, string> = {
  dashboard: 'Vista general de tu mes',
  ingresos: 'Entradas de dinero del periodo',
  gastos: 'Salidas y categorías del periodo',
  presupuestos: 'Planifica límites por categoría y sigue el avance.',
  metas: 'Define objetivos de ahorro o deuda y monitorea el progreso.',
  recurrentes: 'Suscripciones, alquiler y otros cargos que se repiten.',
  reportes: 'Historial de 6 meses, distribución por categoría y exportación.',
  consejos: 'Ideas para optimizar gastos y mejorar hábitos.',
  ia: 'Asistente con Groq usando tus transacciones reales.',
  configuracion: 'Cuenta, moneda, notificaciones y preferencias.',
}
