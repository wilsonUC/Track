import type { MonthlyBarData, ReportCategoryRow, ReportFilter } from './reportesTypes'

/** Datos de ejemplo hasta conectar transacciones reales */
export const mockReportCategories: ReportCategoryRow[] = [
  { nombre: 'Sueldo Principal', total: 'S/ 4,500.00', valorNum: 4500, porcentaje: '60.8%', tipo: 'ingreso', color: 'bg-emerald-500' },
  { nombre: 'Comisiones', total: 'S/ 2,500.00', valorNum: 2500, porcentaje: '33.7%', tipo: 'ingreso', color: 'bg-teal-500' },
  { nombre: 'Alimentación', total: 'S/ 1,200.00', valorNum: 1200, porcentaje: '16.2%', tipo: 'gasto', color: 'bg-rose-500' },
  { nombre: 'Servicios (Luz, Agua)', total: 'S/ 800.00', valorNum: 800, porcentaje: '10.8%', tipo: 'gasto', color: 'bg-violet-500' },
  { nombre: 'Transporte en Scooter', total: 'S/ 400.00', valorNum: 400, porcentaje: '5.4%', tipo: 'gasto', color: 'bg-amber-500' },
  { nombre: 'Educación y Libros', total: 'S/ 180.00', valorNum: 180, porcentaje: '2.4%', tipo: 'gasto', color: 'bg-blue-500' },
]

export const mockMonthlyBars: MonthlyBarData[] = [
  { mes: 'Ene', ing: 2400, gas: 1600, hIng: 'h-24', hGas: 'h-16' },
  { mes: 'Feb', ing: 2800, gas: 2000, hIng: 'h-28', hGas: 'h-20' },
  { mes: 'Mar', ing: 5100, gas: 2910, hIng: 'h-40', hGas: 'h-32' },
  { mes: 'Abr', ing: 4500, gas: 2400, hIng: 'h-32', hGas: 'h-24' },
  { mes: 'May', ing: 3600, gas: 1800, hIng: 'h-26', hGas: 'h-18' },
  { mes: 'Jun', ing: 2500, gas: 1200, hIng: 'h-20', hGas: 'h-10' },
]

export function filterReportCategories(categories: ReportCategoryRow[], filter: ReportFilter) {
  if (filter === 'todos') return categories
  return categories.filter((cat) => cat.tipo === (filter === 'ingresos' ? 'ingreso' : 'gasto'))
}
