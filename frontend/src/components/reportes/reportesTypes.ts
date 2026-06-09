export type ReportFilter = 'todos' | 'ingresos' | 'gastos'

export type ReportCategoryRow = {
  nombre: string
  total: string
  valorNum: number
  porcentaje: string
  tipo: 'ingreso' | 'gasto'
  color: string
}

export type MonthlyBarData = {
  mes: string
  ing: number
  gas: number
  hIng: string
  hGas: string
}
