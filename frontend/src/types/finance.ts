export type Section =
  | 'dashboard'
  | 'ingresos'
  | 'gastos'
  | 'presupuestos'
  | 'metas'
  | 'recurrentes'
  | 'reportes'
  | 'consejos'
  | 'ia'
  | 'configuracion'

export type MovementType = 'income' | 'expense'

export type Category = {
  id: string
  name: string
  icon: string
}
