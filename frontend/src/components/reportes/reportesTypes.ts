export type ReportTab = 'general' | 'ahorros' | 'presupuestos' | 'metas' | 'recurrentes'

export type ReportFilter = 'todos' | 'ingresos' | 'gastos'

export type MetaReportFilter = 'todas' | 'en_progreso' | 'programadas' | 'completadas' | 'vencidas'

export type ReportCategoryRow = {
  nombre: string
  total: string
  valorNum: number
  porcentaje: string
  tipo: 'ingreso' | 'gasto' | 'ahorro'
  color: string
}

export type MonthlyBarData = {
  mes: string
  ing: number
  gas: number
  ingPercent: number
  gasPercent: number
}

// --- GENERAL ---
export type GeneralKpis = {
  totalIngresos: number
  totalGastos: number
  balanceNeto: number
  tasaAhorroPercent: number
  transaccionesCount: number
}

// --- AHORROS ---
export type AhorrosKpis = {
  totalAhorrado: number
  ahorroLibre: number
  ahorroAsignado: number
  aportesPeriodo: number
  movimientosPeriodoCount: number
}

export type AhorroMovimientoRow = {
  id: number
  fecha: string
  monto: number
  montoFormatted: string
  descripcion: string
}

export type AhorrosCompositionSegment = {
  nombre: string
  monto: number
  porcentaje: number
  colorHex: string
}

export type AhorrosMonthlyPoint = {
  mes: string
  aportes: number
  acumulado: number
}

// --- PRESUPUESTOS ---
export type PresupuestosKpis = {
  limiteTotal: number
  gastadoTotal: number
  disponibleTotal: number
  porcentajeEjecucionGlobal: number
  totalPresupuestos: number
  enAlertaCount: number
  excedidosCount: number
  optimosCount: number
}

export type PresupuestoReportItem = {
  id: number
  nombre: string
  categoriaNombre: string | null
  limite: number
  gastado: number
  disponible: number
  porcentaje: number
  estado: 'ok' | 'alerta' | 'excedido'
  consumosCount: number
}

// --- METAS ---
export type MetasKpis = {
  capitalObjetivoTotal: number
  capitalAcumuladoTotal: number
  capitalFaltanteTotal: number
  porcentajeProgresoGlobal: number
  totalMetas: number
  completadasCount: number
  enProgresoCount: number
  programadasCount: number
  vencidasCount: number
}

export type MetaReportItem = {
  id: number
  nombre: string
  montoObjetivo: number
  acumulado: number
  faltante: number
  porcentaje: number
  esAsignacionLibre: boolean
  fechaInicio: string | null
  fechaLimite: string | null
  estado: 'completada' | 'en_progreso' | 'programada' | 'vencida'
  categoriaReferenciaNombre: string | null
}

// --- RECURRENTES ---
export type RecurrentesKpis = {
  gastosFijosMes: number
  ingresosFijosMes: number
  balanceFijoNeto: number
  totalRecurrentes: number
  pagadosTotalCount: number
  pagadosParcialCount: number
  pendientesCount: number
  vencidosCount: number
  porcentajePagado: number
}

export type RecurrenteReportItem = {
  id: number
  nombre: string
  tipo: 'income' | 'expense'
  diaPago: number
  categoriaNombre: string
  montoMes: number
  montoBase: number
  montoPagado: number
  tieneAjusteMes: boolean
  permiteParciales: boolean
  estadoPago: 'pagado' | 'parcial' | 'pendiente' | 'vencido' | 'inactivo'
}
