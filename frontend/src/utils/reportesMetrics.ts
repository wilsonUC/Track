import type {
  AhorroMovimientoRow,
  AhorrosCompositionSegment,
  AhorrosKpis,
  AhorrosMonthlyPoint,
  GeneralKpis,
  MetaReportFilter,
  MetaReportItem,
  MetasKpis,
  MonthlyBarData,
  PresupuestoReportItem,
  PresupuestosKpis,
  RecurrenteReportItem,
  RecurrentesKpis,
  ReportCategoryRow,
  ReportFilter,
} from '../components/reportes/reportesTypes'
import type { ApiAhorro, ResumenAhorros } from '../api/ahorros'
import type { ApiPresupuesto } from '../api/presupuestos'
import type { ApiMeta } from '../api/metas'
import type { ApiRecurrente } from '../api/recurrentes'
import { getCategoryChartColors } from './categoryDisplay'
import { buildLast6MonthsChart, type EnrichedTransaction } from './dashboardMetrics'
import { formatSoles, parseTransactionDate } from './financeFormat'

export type DonutSegment = {
  nombre: string
  valor: number
  porcentaje: number
  colorHex: string
}

const BAR_HEX: Record<string, string> = {
  'bg-slate-500': '#64748b',
  'bg-orange-500': '#f97316',
  'bg-rose-500': '#f43f5e',
  'bg-amber-500': '#f59e0b',
  'bg-violet-500': '#8b5cf6',
  'bg-sky-500': '#0ea5e9',
  'bg-purple-500': '#a855f7',
  'bg-emerald-500': '#10b981',
  'bg-indigo-500': '#6366f1',
  'bg-cyan-500': '#06b6d4',
  'bg-pink-500': '#ec4899',
  'bg-teal-500': '#14b8a6',
}

export function barClassToHex(barClass: string) {
  return BAR_HEX[barClass] ?? '#6366f1'
}

// ==========================================
// 1. GENERAL (INGRESOS & GASTOS)
// ==========================================

export function calculateGeneralKpis(transactions: EnrichedTransaction[]): GeneralKpis {
  let totalIngresos = 0
  let totalGastos = 0

  for (const t of transactions) {
    if (t.tipo === 'income') totalIngresos += t.montoNum
    else if (t.tipo === 'expense') totalGastos += t.montoNum
  }

  const balanceNeto = totalIngresos - totalGastos
  const tasaAhorroPercent = totalIngresos > 0 ? Math.max(0, (balanceNeto / totalIngresos) * 100) : 0

  return {
    totalIngresos,
    totalGastos,
    balanceNeto,
    tasaAhorroPercent,
    transaccionesCount: transactions.length,
  }
}

export function buildMonthlyBarData(
  transactions: EnrichedTransaction[],
  reference = new Date(),
): MonthlyBarData[] {
  const chart = buildLast6MonthsChart(transactions, reference)
  const maxVal = Math.max(...chart.flatMap((p) => [p.ingresos, p.gastos]), 1)

  return chart.map((point) => ({
    mes: point.mes,
    ing: point.ingresos,
    gas: point.gastos,
    ingPercent: (point.ingresos / maxVal) * 100,
    gasPercent: (point.gastos / maxVal) * 100,
  }))
}

const AHORRO_REPORT_COLOR = 'bg-teal-500'

function reportRowColor(nombre: string, tipo: ReportCategoryRow['tipo']) {
  if (tipo === 'ahorro' || nombre === 'Ahorro') return AHORRO_REPORT_COLOR
  return getCategoryChartColors(nombre).colorBg
}

export function buildReportCategoryRows(transactions: EnrichedTransaction[]): ReportCategoryRow[] {
  const totals = new Map<string, { income: number; expense: number; saving: number }>()

  for (const t of transactions) {
    const nombre = t.esAhorro
      ? t.etiquetaOrigen
      : t.esPresupuesto || t.esRecurrente
        ? t.etiquetaOrigen
        : t.categoriaNombre
    const entry = totals.get(nombre) ?? { income: 0, expense: 0, saving: 0 }
    if (t.tipo === 'income') entry.income += t.montoNum
    else if (t.tipo === 'expense') entry.expense += t.montoNum
    else if (t.tipo === 'saving') entry.saving += t.montoNum
    totals.set(nombre, entry)
  }

  const rows: ReportCategoryRow[] = []

  for (const [nombre, { income, expense, saving }] of totals) {
    if (income > 0) {
      rows.push({
        nombre,
        valorNum: income,
        total: formatSoles(income),
        tipo: 'ingreso',
        color: reportRowColor(nombre, 'ingreso'),
        porcentaje: '0%',
      })
    }
    if (expense > 0) {
      rows.push({
        nombre,
        valorNum: expense,
        total: formatSoles(expense),
        tipo: 'gasto',
        color: reportRowColor(nombre, 'gasto'),
        porcentaje: '0%',
      })
    }
    if (saving > 0) {
      rows.push({
        nombre,
        valorNum: saving,
        total: formatSoles(saving),
        tipo: 'ahorro',
        color: reportRowColor(nombre, 'ahorro'),
        porcentaje: '0%',
      })
    }
  }

  const grandTotal = rows.reduce((sum, row) => sum + row.valorNum, 0)

  return rows
    .map((row) => ({
      ...row,
      porcentaje: grandTotal > 0 ? `${((row.valorNum / grandTotal) * 100).toFixed(1)}%` : '0%',
    }))
    .sort((a, b) => b.valorNum - a.valorNum)
}

export function filterReportCategories(categories: ReportCategoryRow[], filter: ReportFilter) {
  if (filter === 'todos') return categories
  const tipo = filter === 'ingresos' ? 'ingreso' : 'gasto'
  const filtered = categories.filter((cat) => cat.tipo === tipo)
  const total = filtered.reduce((sum, cat) => sum + cat.valorNum, 0)

  return filtered.map((cat) => ({
    ...cat,
    porcentaje: total > 0 ? `${((cat.valorNum / total) * 100).toFixed(1)}%` : '0%',
  }))
}

export function buildDonutSegments(categories: ReportCategoryRow[]): DonutSegment[] {
  const total = categories.reduce((sum, cat) => sum + cat.valorNum, 0)
  if (total <= 0) return []

  if (categories.length <= 6) {
    return categories.map((cat) => ({
      nombre: cat.nombre,
      valor: cat.valorNum,
      porcentaje: (cat.valorNum / total) * 100,
      colorHex: barClassToHex(cat.color),
    }))
  }

  // Si hay más de 6 categorías, mostramos las top 5 y agrupamos el resto en "Otros"
  const top5 = categories.slice(0, 5).map((cat) => ({
    nombre: cat.nombre,
    valor: cat.valorNum,
    porcentaje: (cat.valorNum / total) * 100,
    colorHex: barClassToHex(cat.color),
  }))

  const restValue = categories.slice(5).reduce((sum, cat) => sum + cat.valorNum, 0)
  if (restValue > 0) {
    top5.push({
      nombre: 'Otras categorías',
      valor: restValue,
      porcentaje: (restValue / total) * 100,
      colorHex: '#94a3b8', // Slate neutro para agrupar
    })
  }

  return top5
}

export function prepareReportData(
  filteredTransactions: EnrichedTransaction[],
  allTransactions: EnrichedTransaction[] = filteredTransactions,
  referenceDate = new Date(),
) {
  const categoryRows = buildReportCategoryRows(filteredTransactions)
  const monthlyBars = buildMonthlyBarData(allTransactions, referenceDate)
  return { enriched: filteredTransactions, categoryRows, monthlyBars }
}

// ==========================================
// 2. AHORROS
// ==========================================

export function calculateAhorrosReport(
  ahorros: ApiAhorro[],
  resumen: ResumenAhorros | null,
  filteredTransactions: EnrichedTransaction[],
  referenceDate = new Date(),
) {
  const totalAhorrado = Number(resumen?.total || 0)
  const ahorroLibre = Number(resumen?.libre || 0)
  const ahorroAsignado = Number(resumen?.asignado || 0)

  // Aportes en el periodo seleccionado (transacciones tipo saving en el rango)
  const savingTxs = filteredTransactions.filter((t) => t.tipo === 'saving')
  const aportesPeriodo = savingTxs.reduce((sum, t) => sum + t.montoNum, 0)

  const kpis: AhorrosKpis = {
    totalAhorrado,
    ahorroLibre,
    ahorroAsignado,
    aportesPeriodo,
    movimientosPeriodoCount: savingTxs.length,
  }

  // Segmentos de composición (Libre vs Cada meta asignada)
  const composition: AhorrosCompositionSegment[] = []
  const palette = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#3b82f6']

  if (totalAhorrado > 0) {
    if (ahorroLibre > 0) {
      composition.push({
        nombre: 'Fondo Libre / Emergencias',
        monto: ahorroLibre,
        porcentaje: (ahorroLibre / totalAhorrado) * 100,
        colorHex: '#10b981', // Verde esmeralda
      })
    }

    const metasAsignadas = resumen?.metas_asignadas || []
    metasAsignadas.forEach((meta, idx) => {
      const monto = Number(meta.monto)
      if (monto > 0) {
        composition.push({
          nombre: meta.nombre,
          monto,
          porcentaje: (monto / totalAhorrado) * 100,
          colorHex: palette[(idx + 1) % palette.length],
        })
      }
    })
  }

  // Historial mensual de ahorros (últimos 6 meses)
  const monthlyMap = new Map<string, number>()
  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  for (let i = 5; i >= 0; i--) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1)
    const key = `${MESES[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
    monthlyMap.set(key, 0)
  }

  ahorros.forEach((a) => {
    const d = parseTransactionDate(a.fecha)
    if (!isNaN(d.getTime())) {
      const key = `${MESES[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + Number(a.monto))
      }
    }
  })

  let runningAcumulado = 0
  const monthlyPoints: AhorrosMonthlyPoint[] = Array.from(monthlyMap.entries()).map(([mes, aportes]) => {
    runningAcumulado += aportes
    return {
      mes,
      aportes,
      acumulado: runningAcumulado,
    }
  })

  const rows: AhorroMovimientoRow[] = savingTxs.map((t) => ({
    id: t.id,
    fecha: t.fecha,
    monto: t.montoNum,
    montoFormatted: formatSoles(t.montoNum),
    descripcion: t.descripcion || 'Aporte al fondo de ahorro',
  }))

  return { kpis, composition, monthlyPoints, rows }
}

// ==========================================
// 3. PRESUPUESTOS
// ==========================================

export function calculatePresupuestosReport(presupuestos: ApiPresupuesto[]) {
  let limiteTotal = 0
  let gastadoTotal = 0
  let enAlertaCount = 0
  let excedidosCount = 0
  let optimosCount = 0

  const activePresupuestos = presupuestos.filter((p) => p.activo !== false)

  const items: PresupuestoReportItem[] = activePresupuestos.map((p) => {
    const limite = Number(p.limite)
    const gastado = Number(p.gastado)
    const disponible = limite - gastado
    const porcentaje = limite > 0 ? (gastado / limite) * 100 : 0

    limiteTotal += limite
    gastadoTotal += gastado

    let estado: 'ok' | 'alerta' | 'excedido' = 'ok'
    if (porcentaje >= 100) {
      estado = 'excedido'
      excedidosCount++
    } else if (porcentaje >= 80) {
      estado = 'alerta'
      enAlertaCount++
    } else {
      optimosCount++
    }

    return {
      id: p.id,
      nombre: p.nombre,
      categoriaNombre: p.categoria_referencia_nombre,
      limite,
      gastado,
      disponible,
      porcentaje,
      estado,
      consumosCount: p.consumos?.length || 0,
    }
  })

  const disponibleTotal = Math.max(0, limiteTotal - gastadoTotal)
  const porcentajeEjecucionGlobal = limiteTotal > 0 ? (gastadoTotal / limiteTotal) * 100 : 0

  const kpis: PresupuestosKpis = {
    limiteTotal,
    gastadoTotal,
    disponibleTotal,
    porcentajeEjecucionGlobal,
    totalPresupuestos: activePresupuestos.length,
    enAlertaCount,
    excedidosCount,
    optimosCount,
  }

  return { kpis, items }
}

// ==========================================
// 4. METAS
// ==========================================

export function calculateMetasReport(
  metas: ApiMeta[],
  filter: MetaReportFilter = 'todas',
) {
  let capitalObjetivoTotal = 0
  let capitalAcumuladoTotal = 0
  let completadasCount = 0
  let enProgresoCount = 0
  let programadasCount = 0
  let vencidasCount = 0

  const activeMetas = metas.filter((m) => m.activo !== false)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const allItems: MetaReportItem[] = activeMetas.map((m) => {
    const montoObjetivo = Number(m.monto_objetivo)
    const acumulado = Number(m.acumulado)
    const faltante = Math.max(0, montoObjetivo - acumulado)
    const porcentaje = montoObjetivo > 0 ? Math.min(100, (acumulado / montoObjetivo) * 100) : 0

    capitalObjetivoTotal += montoObjetivo
    capitalAcumuladoTotal += acumulado

    let estado: MetaReportItem['estado'] = 'en_progreso'
    const fechaInicioDate = m.fecha_inicio ? new Date(m.fecha_inicio) : null
    const fechaLimiteDate = m.fecha_limite ? new Date(m.fecha_limite) : null

    if (m.completada || porcentaje >= 100) {
      estado = 'completada'
      completadasCount++
    } else if (fechaInicioDate && fechaInicioDate > today) {
      estado = 'programada'
      programadasCount++
    } else if (fechaLimiteDate && fechaLimiteDate < today) {
      estado = 'vencida'
      vencidasCount++
    } else {
      estado = 'en_progreso'
      enProgresoCount++
    }

    return {
      id: m.id,
      nombre: m.nombre,
      montoObjetivo,
      acumulado,
      faltante,
      porcentaje,
      esAsignacionLibre: m.es_asignacion_libre,
      fechaInicio: m.fecha_inicio,
      fechaLimite: m.fecha_limite,
      estado,
      categoriaReferenciaNombre: m.categoria_referencia_nombre,
    }
  })

  const capitalFaltanteTotal = Math.max(0, capitalObjetivoTotal - capitalAcumuladoTotal)
  const porcentajeProgresoGlobal =
    capitalObjetivoTotal > 0 ? (capitalAcumuladoTotal / capitalObjetivoTotal) * 100 : 0

  const kpis: MetasKpis = {
    capitalObjetivoTotal,
    capitalAcumuladoTotal,
    capitalFaltanteTotal,
    porcentajeProgresoGlobal,
    totalMetas: activeMetas.length,
    completadasCount,
    enProgresoCount,
    programadasCount,
    vencidasCount,
  }

  const items =
    filter === 'todas'
      ? allItems
      : filter === 'programadas'
        ? allItems.filter((i) => i.estado === 'programada')
        : filter === 'completadas'
          ? allItems.filter((i) => i.estado === 'completada')
          : filter === 'vencidas'
            ? allItems.filter((i) => i.estado === 'vencida')
            : allItems.filter((i) => i.estado === 'en_progreso')

  return { kpis, items, allItems }
}

// ==========================================
// 5. RECURRENTES
// ==========================================

export function calculateRecurrentesReport(recurrentes: ApiRecurrente[]) {
  let gastosFijosMes = 0
  let ingresosFijosMes = 0
  let pagadosTotalCount = 0
  let pagadosParcialCount = 0
  let pendientesCount = 0
  let vencidosCount = 0

  const activeRecurrentes = recurrentes.filter((r) => r.activo && r.activo_en_mes)

  const items: RecurrenteReportItem[] = activeRecurrentes.map((r) => {
    const montoMes = Number(r.monto)
    const montoBase = Number(r.monto_base || r.monto)
    const montoPagado = Number(r.monto_pagado || 0)

    if (r.tipo === 'expense') gastosFijosMes += montoMes
    else if (r.tipo === 'income') ingresosFijosMes += montoMes

    let estadoPago: RecurrenteReportItem['estadoPago'] = 'pendiente'
    if (!r.activo_en_mes) {
      estadoPago = 'inactivo'
    } else if (r.registrado_mes || montoPagado >= montoMes) {
      estadoPago = 'pagado'
      pagadosTotalCount++
    } else if (montoPagado > 0) {
      estadoPago = 'parcial'
      pagadosParcialCount++
    } else if (r.vencido) {
      estadoPago = 'vencido'
      vencidosCount++
    } else {
      estadoPago = 'pendiente'
      pendientesCount++
    }

    return {
      id: r.id,
      nombre: r.nombre,
      tipo: r.tipo,
      diaPago: r.dia_pago,
      categoriaNombre: r.categoria_nombre,
      montoMes,
      montoBase,
      montoPagado,
      tieneAjusteMes: Boolean(r.tiene_ajuste_mes),
      permiteParciales: r.permite_parciales,
      estadoPago,
    }
  })

  const balanceFijoNeto = ingresosFijosMes - gastosFijosMes
  const activeCount = items.length
  const porcentajePagado = activeCount > 0 ? (pagadosTotalCount / activeCount) * 100 : 0

  const kpis: RecurrentesKpis = {
    gastosFijosMes,
    ingresosFijosMes,
    balanceFijoNeto,
    totalRecurrentes: activeCount,
    pagadosTotalCount,
    pagadosParcialCount,
    pendientesCount,
    vencidosCount,
    porcentajePagado,
  }

  return { kpis, items }
}

// ==========================================
// EXPORTACIÓN CSV
// ==========================================

function downloadCsvFile(filename: string, lines: string[]) {
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadReportCsv(
  categories: ReportCategoryRow[],
  monthlyBars: MonthlyBarData[],
  filter: ReportFilter,
  dateLabel?: string,
) {
  const filterLabel = filter === 'todos' ? 'Todo' : filter === 'ingresos' ? 'Ingresos' : 'Gastos'
  const lines = [
    'Reporte General - FinanzasTrack',
    `Filtro tipo: ${filterLabel}`,
    dateLabel ? `Período: ${dateLabel}` : 'Período: Total',
    `Generado: ${new Date().toLocaleString('es-PE')}`,
    '',
    'Historial mensual (últimos 6 meses)',
    'Mes,Ingresos,Gastos',
    ...monthlyBars.map((bar) => `${bar.mes},${bar.ing},${bar.gas}`),
    '',
    'Desglose por categoría',
    'Categoría,Tipo,Peso %,Total',
    ...categories.map((cat) => `${cat.nombre},${cat.tipo},${cat.porcentaje},${cat.valorNum}`),
  ]

  downloadCsvFile(`reporte-general-${new Date().toISOString().slice(0, 10)}.csv`, lines)
}

export function downloadAhorrosCsv(
  kpis: AhorrosKpis,
  movimientos: AhorroMovimientoRow[],
  composition: AhorrosCompositionSegment[],
  dateLabel?: string,
) {
  const lines = [
    'Reporte de Ahorros - FinanzasTrack',
    dateLabel ? `Período: ${dateLabel}` : 'Período: Total',
    `Generado: ${new Date().toLocaleString('es-PE')}`,
    '',
    'Métricas Clave',
    `Total Ahorrado,S/ ${kpis.totalAhorrado.toFixed(2)}`,
    `Ahorro Libre,S/ ${kpis.ahorroLibre.toFixed(2)}`,
    `Ahorro Asignado a Metas,S/ ${kpis.ahorroAsignado.toFixed(2)}`,
    `Aportes en el Periodo,S/ ${kpis.aportesPeriodo.toFixed(2)}`,
    '',
    'Composición del Fondo',
    'Destino,Monto (S/),Porcentaje %',
    ...composition.map((c) => `${c.nombre},${c.monto.toFixed(2)},${c.porcentaje.toFixed(1)}%`),
    '',
    'Historial de Movimientos',
    'Fecha,Monto (S/),Descripción',
    ...movimientos.map((m) => `${m.fecha},${m.monto.toFixed(2)},"${m.descripcion}"`),
  ]

  downloadCsvFile(`reporte-ahorros-${new Date().toISOString().slice(0, 10)}.csv`, lines)
}

export function downloadPresupuestosCsv(
  kpis: PresupuestosKpis,
  items: PresupuestoReportItem[],
  dateLabel?: string,
) {
  const lines = [
    'Reporte de Presupuestos - FinanzasTrack',
    dateLabel ? `Mes: ${dateLabel}` : 'Período: Mes Actual',
    `Generado: ${new Date().toLocaleString('es-PE')}`,
    '',
    'Métricas Clave',
    `Límite Total Presupuestado,S/ ${kpis.limiteTotal.toFixed(2)}`,
    `Gasto Real Acumulado,S/ ${kpis.gastadoTotal.toFixed(2)}`,
    `Disponible Total,S/ ${kpis.disponibleTotal.toFixed(2)}`,
    `% Ejecución Global,${kpis.porcentajeEjecucionGlobal.toFixed(1)}%`,
    '',
    'Detalle por Presupuesto',
    'Presupuesto,Categoría Ref,Límite (S/),Gastado (S/),Disponible (S/),% Consumido,Estado',
    ...items.map(
      (p) =>
        `"${p.nombre}","${p.categoriaNombre || 'Sin categoría'}",${p.limite.toFixed(2)},${p.gastado.toFixed(2)},${p.disponible.toFixed(2)},${p.porcentaje.toFixed(1)}%,${p.estado.toUpperCase()}`,
    ),
  ]

  downloadCsvFile(`reporte-presupuestos-${new Date().toISOString().slice(0, 10)}.csv`, lines)
}

export function downloadMetasCsv(kpis: MetasKpis, items: MetaReportItem[]) {
  const lines = [
    'Reporte de Metas de Ahorro - FinanzasTrack',
    `Generado: ${new Date().toLocaleString('es-PE')}`,
    '',
    'Métricas Clave',
    `Capital Objetivo Total,S/ ${kpis.capitalObjetivoTotal.toFixed(2)}`,
    `Capital Acumulado Total,S/ ${kpis.capitalAcumuladoTotal.toFixed(2)}`,
    `Capital Faltante,S/ ${kpis.capitalFaltanteTotal.toFixed(2)}`,
    `% Progreso Global,${kpis.porcentajeProgresoGlobal.toFixed(1)}%`,
    `Metas Completadas,${kpis.completadasCount} de ${kpis.totalMetas}`,
    '',
    'Detalle de Metas',
    'Meta,Categoría Ref,Tipo Asignación,Objetivo (S/),Acumulado (S/),Faltante (S/),% Avance,Fecha Límite,Estado',
    ...items.map(
      (m) =>
        `"${m.nombre}","${m.categoriaReferenciaNombre || 'General'}",${m.esAsignacionLibre ? 'Libre' : 'Formal (Fondo)'},${m.montoObjetivo.toFixed(2)},${m.acumulado.toFixed(2)},${m.faltante.toFixed(2)},${m.porcentaje.toFixed(1)}%,${m.fechaLimite || 'Sin fecha'},${m.estado.toUpperCase()}`,
    ),
  ]

  downloadCsvFile(`reporte-metas-${new Date().toISOString().slice(0, 10)}.csv`, lines)
}

export function downloadRecurrentesCsv(
  kpis: RecurrentesKpis,
  items: RecurrenteReportItem[],
  dateLabel?: string,
) {
  const lines = [
    'Reporte de Recurrentes (Compromisos Fijos) - FinanzasTrack',
    dateLabel ? `Mes: ${dateLabel}` : 'Período: Mes Actual',
    `Generado: ${new Date().toLocaleString('es-PE')}`,
    '',
    'Métricas Clave',
    `Gastos Fijos / Mes,S/ ${kpis.gastosFijosMes.toFixed(2)}`,
    `Ingresos Fijos / Mes,S/ ${kpis.ingresosFijosMes.toFixed(2)}`,
    `Balance Fijo Neto,S/ ${kpis.balanceFijoNeto.toFixed(2)}`,
    `% Pagados al Día,${kpis.porcentajePagado.toFixed(1)}%`,
    '',
    'Detalle de Recurrentes',
    'Nombre,Tipo,Categoría,Día Pago,Monto Mes (S/),Monto Base (S/),Pagado (S/),Ajustado,Estado',
    ...items.map(
      (r) =>
        `"${r.nombre}",${r.tipo === 'income' ? 'Ingreso Fijo' : 'Gasto Fijo'},"${r.categoriaNombre}",${r.diaPago},${r.montoMes.toFixed(2)},${r.montoBase.toFixed(2)},${r.montoPagado.toFixed(2)},${r.tieneAjusteMes ? 'Sí' : 'No'},${r.estadoPago.toUpperCase()}`,
    ),
  ]

  downloadCsvFile(`reporte-recurrentes-${new Date().toISOString().slice(0, 10)}.csv`, lines)
}
