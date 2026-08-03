export type RecurrenteCardView = {
  id: number
  nombre: string
  monto: number
  tipo: 'income' | 'expense'
  diaPago: number
  categoriaId: number
  categoriaNombre: string
  registradoMes: boolean
  vencido: boolean
  mesAnteriorSinRegistrar: string | null
  fechaInicio: string | null
  fechaFin: string | null
  activoEnMes: boolean
  estadoPeriodo: 'activo' | 'no_iniciado' | 'finalizado' | 'futuro'
}
