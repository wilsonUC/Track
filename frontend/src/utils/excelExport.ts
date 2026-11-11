import { strToU8, zipSync } from 'fflate'
import type { ApiAhorro, ResumenAhorros } from '../api/ahorros'
import type { EnrichedTransaction } from './dashboardMetrics'
import type { PresupuestoCardView } from './presupuestosDisplay'
import type {
  AhorroMovimientoRow,
  AhorrosCompositionSegment,
  AhorrosKpis,
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

// ==========================================
// TIPOS DEL CONSTRUCTOR XLSX (OPENXML)
// ==========================================

export type XlsxCol = { width: number }

export type XlsxCell =
  | { type: 'string'; value: string; style?: number }
  | { type: 'number'; value: number; style?: number }
  | { type: 'empty' }

export type XlsxRow = XlsxCell[]

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function colLetter(idx: number): string {
  let letter = ''
  let temp = idx
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter
    temp = Math.floor(temp / 26) - 1
  }
  return letter
}

// ==========================================
// PLANTILLAS XML DE OPENXML (.XLSX)
// ==========================================

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

const WORKBOOK_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

/**
 * Tabla de estilos corporativos de FinanzasTrack:
 * Fonts, Fills (#1E3A8A Navy, #F1F5F9 Slate, #F8FAFC Zebra, etc.),
 * Borders, y Formatos numéricos (S/ #,##0.00 y 0.0%)
 */
const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="2">
    <numFmt numFmtId="164" formatCode="&quot;S/ &quot;#,##0.00"/>
    <numFmt numFmtId="165" formatCode="0.0%"/>
  </numFmts>
  <fonts count="9">
    <!-- 0: Regular 10pt -->
    <font><sz val="10"/><color rgb="FF1E293B"/><name val="Segoe UI"/></font>
    <!-- 1: Bold White 10pt (Header) -->
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Segoe UI"/></font>
    <!-- 2: Title 14pt Navy -->
    <font><b/><sz val="14"/><color rgb="FF1E3A8A"/><name val="Segoe UI"/></font>
    <!-- 3: Subtitle / Meta 9pt Slate -->
    <font><sz val="9"/><color rgb="FF64748B"/><name val="Segoe UI"/></font>
    <!-- 4: Bold Dark 10pt -->
    <font><b/><sz val="10"/><color rgb="FF0F172A"/><name val="Segoe UI"/></font>
    <!-- 5: Bold Green 10pt (Ingreso) -->
    <font><b/><sz val="10"/><color rgb="FF15803D"/><name val="Segoe UI"/></font>
    <!-- 6: Bold Red 10pt (Gasto) -->
    <font><b/><sz val="10"/><color rgb="FFB91C1C"/><name val="Segoe UI"/></font>
    <!-- 7: Bold Teal 10pt (Ahorro) -->
    <font><b/><sz val="10"/><color rgb="FF0F766E"/><name val="Segoe UI"/></font>
    <!-- 8: Bold Orange 10pt (Alerta) -->
    <font><b/><sz val="10"/><color rgb="FFB45309"/><name val="Segoe UI"/></font>
  </fonts>
  <fills count="6">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <!-- 2: Navy Header (#1E3A8A) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E3A8A"/><bgColor indexed="64"/></patternFill></fill>
    <!-- 3: Light Slate KPI Header (#F1F5F9) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill>
    <!-- 4: Zebra Row (#F8FAFC) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
    <!-- 5: Total Row (#E2E8F0) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFE2E8F0"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="3">
    <!-- 0: None -->
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <!-- 1: Thin border (#CBD5E1) -->
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
    <!-- 2: Total row border (top thin, bottom double) -->
    <border>
      <left/><right/>
      <top style="thin"><color rgb="FF64748B"/></top>
      <bottom style="double"><color rgb="FF64748B"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="25">
    <!-- 0: Default Regular -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <!-- 1: Brand Title (Font 2) -->
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <!-- 2: Subtitle (Font 3) -->
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <!-- 3: Section Title (Font 4) -->
    <xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <!-- 4: Header Left (Font 1, Fill 2 Navy, Border 1) -->
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <!-- 5: Header Center -->
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 6: Header Right -->
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <!-- 7: Data Left Regular -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <!-- 8: Data Left Even -->
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <!-- 9: Data Center Regular -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 10: Data Center Even -->
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 11: Currency Right (Regular) -->
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <!-- 12: Currency Right (Even) -->
    <xf numFmtId="164" fontId="0" fillId="4" borderId="1" xfId="0" applyFont="1" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <!-- 13: Percent Right (Regular) -->
    <xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <!-- 14: Percent Right (Even) -->
    <xf numFmtId="165" fontId="0" fillId="4" borderId="1" xfId="0" applyFont="1" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <!-- 15: Tag Green Center (INGRESO) -->
    <xf numFmtId="0" fontId="5" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 16: Tag Red Center (GASTO) -->
    <xf numFmtId="0" fontId="6" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 17: Tag Teal Center (AHORRO) -->
    <xf numFmtId="0" fontId="7" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 18: Tag Warning Center (Alerta) -->
    <xf numFmtId="0" fontId="8" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 19: Total Label Right -->
    <xf numFmtId="0" fontId="4" fillId="5" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <!-- 20: Total Currency Right -->
    <xf numFmtId="164" fontId="4" fillId="5" borderId="2" xfId="0" applyFont="1" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <!-- 21: KPI Header -->
    <xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 22: KPI Value Currency -->
    <xf numFmtId="164" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 23: KPI Value Number -->
    <xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 24: KPI Value Percent -->
    <xf numFmtId="165" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
  </cellXfs>
</styleSheet>`

/**
 * Compila y descarga un archivo .xlsx binario nativo (OpenXML)
 * usando compresión ZIP pura (fflate) sin advertencias de Excel.
 */
function downloadXlsxFile(
  filename: string,
  sheetName: string,
  cols: XlsxCol[],
  rows: XlsxRow[],
) {
  const safeSheet = sheetName.replace(/[:\\/?*[\]]/g, '').slice(0, 31) || 'Reporte'

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(safeSheet)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`

  // Generar columnas
  const colsXml = cols.length > 0
    ? `<cols>${cols.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.width}" customWidth="1"/>`).join('')}</cols>`
    : ''

  // Generar filas y celdas
  const rowsXml = rows
    .map((row, rIdx) => {
      const rowNum = rIdx + 1
      const cellsXml = row
        .map((cell, cIdx) => {
          if (cell.type === 'empty') return ''
          const ref = `${colLetter(cIdx)}${rowNum}`
          const s = cell.style !== undefined ? ` s="${cell.style}"` : ''
          if (cell.type === 'number') {
            return `<c r="${ref}"${s}><v>${cell.value}</v></c>`
          }
          return `<c r="${ref}"${s} t="inlineStr"><is><t>${escapeXml(cell.value)}</t></is></c>`
        })
        .join('')
      return `<row r="${rowNum}">${cellsXml}</row>`
    })
    .join('')

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${colsXml}
  <sheetData>
    ${rowsXml}
  </sheetData>
</worksheet>`

  // Empaquetar el ZIP con fflate
  const zipData = zipSync({
    '[Content_Types].xml': strToU8(CONTENT_TYPES_XML),
    '_rels/.rels': strToU8(ROOT_RELS_XML),
    'xl/_rels/workbook.xml.rels': strToU8(WORKBOOK_RELS_XML),
    'xl/workbook.xml': strToU8(workbookXml),
    'xl/styles.xml': strToU8(STYLES_XML),
    'xl/worksheets/sheet1.xml': strToU8(sheetXml),
  })

  // Descarga del archivo .xlsx con su MIME Type oficial
  const blob = new Blob([zipData.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  anchor.click()
  URL.revokeObjectURL(url)
}

// ==========================================
// 1. EXPORTAR TRANSACCIONES (INGRESOS O GASTOS)
// ==========================================

export function exportTransactionsToExcel(
  transactions: EnrichedTransaction[],
  variant: 'income' | 'expense',
  periodLabel: string,
) {
  const isIncome = variant === 'income'
  const title = isIncome ? 'Reporte de Ingresos' : 'Reporte de Gastos'
  const total = transactions.reduce((acc, t) => acc + t.montoNum, 0)
  const now = new Date().toLocaleString('es-PE')

  const cols: XlsxCol[] = [
    { width: 6 },
    { width: 14 },
    { width: 22 },
    { width: 36 },
    { width: 18 },
  ]

  const rows: XlsxRow[] = [
    [{ type: 'string', value: `FinanzasTrack · ${title}`, style: 1 }],
    [{ type: 'string', value: `Período: ${periodLabel} · Generado: ${now}`, style: 2 }],
    [{ type: 'empty' }],
    // KPIs
    [
      { type: 'string', value: 'Total Acumulado', style: 21 },
      { type: 'string', value: 'N° de Registros', style: 21 },
    ],
    [
      { type: 'number', value: total, style: 22 },
      { type: 'number', value: transactions.length, style: 23 },
    ],
    [{ type: 'empty' }],
    // Encabezados
    [
      { type: 'string', value: '#', style: 5 },
      { type: 'string', value: 'Fecha', style: 5 },
      { type: 'string', value: 'Categoría', style: 4 },
      { type: 'string', value: 'Descripción', style: 4 },
      { type: 'string', value: 'Monto (S/)', style: 6 },
    ],
  ]

  // Filas de datos
  transactions.forEach((t, idx) => {
    const isEven = idx % 2 === 0
    rows.push([
      { type: 'number', value: idx + 1, style: isEven ? 10 : 9 },
      { type: 'string', value: t.fecha, style: isEven ? 10 : 9 },
      { type: 'string', value: t.categoriaNombre, style: isEven ? 8 : 7 },
      { type: 'string', value: t.descripcion || '—', style: isEven ? 8 : 7 },
      { type: 'number', value: t.montoNum, style: isEven ? 12 : 11 },
    ])
  })

  // Fila total
  rows.push([
    { type: 'empty' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'string', value: 'TOTAL:', style: 19 },
    { type: 'number', value: total, style: 20 },
  ])

  const dateSlug = new Date().toISOString().slice(0, 10)
  downloadXlsxFile(`${variant === 'income' ? 'ingresos' : 'gastos'}-${dateSlug}.xlsx`, title, cols, rows)
}

// ==========================================
// 2. EXPORTAR PRESUPUESTOS
// ==========================================

export function exportPresupuestosToExcel(
  presupuestos: PresupuestoCardView[],
  mesLabel: string,
) {
  const now = new Date().toLocaleString('es-PE')
  const totalLimite = presupuestos.reduce((acc, p) => acc + p.limite, 0)
  const totalGastado = presupuestos.reduce((acc, p) => acc + p.gastado, 0)
  const totalDisponible = Math.max(0, totalLimite - totalGastado)
  const porcentajeGlobal = totalLimite > 0 ? totalGastado / totalLimite : 0

  const cols: XlsxCol[] = [
    { width: 6 },
    { width: 26 },
    { width: 20 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 14 },
    { width: 14 },
  ]

  const rows: XlsxRow[] = [
    [{ type: 'string', value: 'FinanzasTrack · Presupuestos Mensuales', style: 1 }],
    [{ type: 'string', value: `Mes: ${mesLabel} · Generado: ${now}`, style: 2 }],
    [{ type: 'empty' }],
    // KPIs
    [
      { type: 'string', value: 'Límite Total', style: 21 },
      { type: 'string', value: 'Gasto Total', style: 21 },
      { type: 'string', value: 'Disponible', style: 21 },
      { type: 'string', value: '% Ejecución', style: 21 },
    ],
    [
      { type: 'number', value: totalLimite, style: 22 },
      { type: 'number', value: totalGastado, style: 22 },
      { type: 'number', value: totalDisponible, style: 22 },
      { type: 'number', value: porcentajeGlobal, style: 24 },
    ],
    [{ type: 'empty' }],
    // Encabezados
    [
      { type: 'string', value: '#', style: 5 },
      { type: 'string', value: 'Presupuesto', style: 4 },
      { type: 'string', value: 'Categoría', style: 4 },
      { type: 'string', value: 'Límite (S/)', style: 6 },
      { type: 'string', value: 'Gastado (S/)', style: 6 },
      { type: 'string', value: 'Disponible (S/)', style: 6 },
      { type: 'string', value: '% Consumo', style: 6 },
      { type: 'string', value: 'Estado', style: 5 },
    ],
  ]

  presupuestos.forEach((p, idx) => {
    const isEven = idx % 2 === 0
    const disponible = Math.max(0, p.limite - p.gastado)
    const estadoLabel = p.gastado > p.limite ? 'Excedido' : p.porcentaje >= 85 ? 'Alerta' : 'Normal'
    const estadoStyle = p.gastado > p.limite ? 16 : p.porcentaje >= 85 ? 18 : 15

    rows.push([
      { type: 'number', value: idx + 1, style: isEven ? 10 : 9 },
      { type: 'string', value: p.nombre, style: isEven ? 8 : 7 },
      { type: 'string', value: p.iconCategory || 'General', style: isEven ? 8 : 7 },
      { type: 'number', value: p.limite, style: isEven ? 12 : 11 },
      { type: 'number', value: p.gastado, style: isEven ? 12 : 11 },
      { type: 'number', value: disponible, style: isEven ? 12 : 11 },
      { type: 'number', value: p.porcentaje / 100, style: isEven ? 14 : 13 },
      { type: 'string', value: estadoLabel, style: estadoStyle },
    ])
  })

  // Totales
  rows.push([
    { type: 'empty' },
    { type: 'empty' },
    { type: 'string', value: 'TOTALES:', style: 19 },
    { type: 'number', value: totalLimite, style: 20 },
    { type: 'number', value: totalGastado, style: 20 },
    { type: 'number', value: totalDisponible, style: 20 },
    { type: 'number', value: porcentajeGlobal, style: 20 },
    { type: 'empty' },
  ])

  const dateSlug = new Date().toISOString().slice(0, 10)
  downloadXlsxFile(`presupuestos-${dateSlug}.xlsx`, 'Presupuestos', cols, rows)
}

// ==========================================
// 3. EXPORTAR AHORROS Y MOVIMIENTOS
// ==========================================

export function exportAhorrosToExcel(
  resumen: ResumenAhorros | null,
  movimientos: ApiAhorro[],
) {
  const now = new Date().toLocaleString('es-PE')
  const total = Number(resumen?.total ?? 0)
  const libre = Number(resumen?.libre ?? 0)
  const asignado = Number(resumen?.asignado ?? 0)

  const cols: XlsxCol[] = [
    { width: 6 },
    { width: 14 },
    { width: 34 },
    { width: 18 },
  ]

  const rows: XlsxRow[] = [
    [{ type: 'string', value: 'FinanzasTrack · Reporte de Fondos de Ahorro', style: 1 }],
    [{ type: 'string', value: `Generado: ${now}`, style: 2 }],
    [{ type: 'empty' }],
    // KPIs
    [
      { type: 'string', value: 'Total Ahorrado', style: 21 },
      { type: 'string', value: 'Ahorro Libre', style: 21 },
      { type: 'string', value: 'Asignado a Metas', style: 21 },
    ],
    [
      { type: 'number', value: total, style: 22 },
      { type: 'number', value: libre, style: 22 },
      { type: 'number', value: asignado, style: 22 },
    ],
    [{ type: 'empty' }],
    [{ type: 'string', value: 'Historial de Movimientos de Ahorro', style: 3 }],
    [
      { type: 'string', value: '#', style: 5 },
      { type: 'string', value: 'Fecha', style: 5 },
      { type: 'string', value: 'Descripción', style: 4 },
      { type: 'string', value: 'Monto (S/)', style: 6 },
    ],
  ]

  movimientos.forEach((m, idx) => {
    const isEven = idx % 2 === 0
    rows.push([
      { type: 'number', value: idx + 1, style: isEven ? 10 : 9 },
      { type: 'string', value: m.fecha, style: isEven ? 10 : 9 },
      { type: 'string', value: m.descripcion || 'Aporte al ahorro', style: isEven ? 8 : 7 },
      { type: 'number', value: Number(m.monto), style: isEven ? 12 : 11 },
    ])
  })

  // Total
  rows.push([
    { type: 'empty' },
    { type: 'empty' },
    { type: 'string', value: 'TOTAL FONDO:', style: 19 },
    { type: 'number', value: total, style: 20 },
  ])

  const dateSlug = new Date().toISOString().slice(0, 10)
  downloadXlsxFile(`ahorros-${dateSlug}.xlsx`, 'Ahorros', cols, rows)
}

// ==========================================
// 4. EXPORTAR REPORTE GENERAL (PESTAÑA GENERAL)
// ==========================================

export function exportReportGeneralExcel(
  categories: ReportCategoryRow[],
  monthlyBars: MonthlyBarData[],
  filter: ReportFilter,
  dateLabel?: string,
) {
  const filterLabel = filter === 'todos' ? 'Ingresos y Gastos' : filter === 'ingresos' ? 'Solo Ingresos' : 'Solo Gastos'
  const now = new Date().toLocaleString('es-PE')

  const cols: XlsxCol[] = [
    { width: 26 },
    { width: 14 },
    { width: 16 },
    { width: 20 },
  ]

  const rows: XlsxRow[] = [
    [{ type: 'string', value: 'FinanzasTrack · Reporte General', style: 1 }],
    [{ type: 'string', value: `Filtro: ${filterLabel} · Período: ${dateLabel || 'Total'} · ${now}`, style: 2 }],
    [{ type: 'empty' }],
    // Sección 1: Historial Mensual
    [{ type: 'string', value: 'Historial Comparativo Mensual', style: 3 }],
    [
      { type: 'string', value: 'Mes', style: 5 },
      { type: 'string', value: 'Ingresos (S/)', style: 6 },
      { type: 'string', value: 'Gastos (S/)', style: 6 },
      { type: 'string', value: 'Balance Neto (S/)', style: 6 },
    ],
  ]

  monthlyBars.forEach((bar, idx) => {
    const isEven = idx % 2 === 0
    rows.push([
      { type: 'string', value: bar.mes, style: isEven ? 10 : 9 },
      { type: 'number', value: bar.ing, style: isEven ? 12 : 11 },
      { type: 'number', value: bar.gas, style: isEven ? 12 : 11 },
      { type: 'number', value: bar.ing - bar.gas, style: isEven ? 12 : 11 },
    ])
  })

  rows.push([{ type: 'empty' }])
  // Sección 2: Desglose por Categoría
  rows.push([{ type: 'string', value: 'Desglose detallado por categoría', style: 3 }])
  rows.push([
    { type: 'string', value: 'Categoría', style: 4 },
    { type: 'string', value: 'Tipo', style: 5 },
    { type: 'string', value: 'Peso relativo', style: 6 },
    { type: 'string', value: 'Total acumulado', style: 6 },
  ])

  categories.forEach((cat, idx) => {
    const isEven = idx % 2 === 0
    const tipoLabel =
      cat.tipo === 'ingreso'
        ? 'INGRESO'
        : cat.tipo === 'ahorro'
          ? 'AHORRO'
          : 'GASTO'

    const tagStyle =
      cat.tipo === 'ingreso'
        ? 15 // Verde
        : cat.tipo === 'ahorro'
          ? 17 // Teal
          : 16 // Rojo

    // Extraer número de porcentaje limpio (ej. "43.2%" -> 0.432)
    const numPorcentaje = typeof cat.porcentaje === 'string'
      ? parseFloat(cat.porcentaje.replace('%', '')) || 0
      : Number(cat.porcentaje) || 0

    rows.push([
      { type: 'string', value: cat.nombre || 'Sin categoría', style: isEven ? 8 : 7 },
      { type: 'string', value: tipoLabel, style: tagStyle },
      { type: 'number', value: numPorcentaje / 100, style: isEven ? 14 : 13 },
      { type: 'number', value: cat.valorNum, style: isEven ? 12 : 11 },
    ])
  })

  const dateSlug = new Date().toISOString().slice(0, 10)
  downloadXlsxFile(`reporte-general-${dateSlug}.xlsx`, 'General', cols, rows)
}

// ==========================================
// 5. EXPORTAR REPORTE DE AHORROS
// ==========================================

export function exportReportAhorrosExcel(
  kpis: AhorrosKpis,
  movimientos: AhorroMovimientoRow[],
  composition: AhorrosCompositionSegment[],
  dateLabel?: string,
) {
  const now = new Date().toLocaleString('es-PE')

  const cols: XlsxCol[] = [
    { width: 24 },
    { width: 28 },
    { width: 18 },
    { width: 16 },
  ]

  const rows: XlsxRow[] = [
    [{ type: 'string', value: 'FinanzasTrack · Reporte de Ahorros', style: 1 }],
    [{ type: 'string', value: `Período: ${dateLabel || 'Total'} · Generado: ${now}`, style: 2 }],
    [{ type: 'empty' }],
    // KPIs
    [
      { type: 'string', value: 'Total Ahorrado', style: 21 },
      { type: 'string', value: 'Ahorro Libre', style: 21 },
      { type: 'string', value: 'En Metas', style: 21 },
      { type: 'string', value: 'Aportes Período', style: 21 },
    ],
    [
      { type: 'number', value: kpis.totalAhorrado, style: 22 },
      { type: 'number', value: kpis.ahorroLibre, style: 22 },
      { type: 'number', value: kpis.ahorroAsignado, style: 22 },
      { type: 'number', value: kpis.aportesPeriodo, style: 22 },
    ],
    [{ type: 'empty' }],
    // Composición
    [{ type: 'string', value: 'Composición del Fondo de Ahorro', style: 3 }],
    [
      { type: 'string', value: 'Destino', style: 4 },
      { type: 'string', value: 'Monto (S/)', style: 6 },
      { type: 'string', value: 'Porcentaje', style: 6 },
    ],
  ]

  composition.forEach((c, idx) => {
    const isEven = idx % 2 === 0
    rows.push([
      { type: 'string', value: c.nombre, style: isEven ? 8 : 7 },
      { type: 'number', value: c.monto, style: isEven ? 12 : 11 },
      { type: 'number', value: c.porcentaje / 100, style: isEven ? 14 : 13 },
    ])
  })

  rows.push([{ type: 'empty' }])
  // Movimientos
  rows.push([{ type: 'string', value: 'Movimientos en el Período', style: 3 }])
  rows.push([
    { type: 'string', value: 'Fecha', style: 5 },
    { type: 'string', value: 'Descripción', style: 4 },
    { type: 'string', value: 'Monto (S/)', style: 6 },
  ])

  movimientos.forEach((m, idx) => {
    const isEven = idx % 2 === 0
    rows.push([
      { type: 'string', value: m.fecha, style: isEven ? 10 : 9 },
      { type: 'string', value: m.descripcion, style: isEven ? 8 : 7 },
      { type: 'number', value: m.monto, style: isEven ? 12 : 11 },
    ])
  })

  const dateSlug = new Date().toISOString().slice(0, 10)
  downloadXlsxFile(`reporte-ahorros-${dateSlug}.xlsx`, 'Ahorros', cols, rows)
}

// ==========================================
// 6. EXPORTAR REPORTE DE PRESUPUESTOS
// ==========================================

export function exportReportPresupuestosExcel(
  kpis: PresupuestosKpis,
  items: PresupuestoReportItem[],
  dateLabel?: string,
) {
  const now = new Date().toLocaleString('es-PE')

  const cols: XlsxCol[] = [
    { width: 24 },
    { width: 20 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 14 },
    { width: 14 },
  ]

  const rows: XlsxRow[] = [
    [{ type: 'string', value: 'FinanzasTrack · Reporte de Presupuestos', style: 1 }],
    [{ type: 'string', value: `Período: ${dateLabel || 'Mes Actual'} · Generado: ${now}`, style: 2 }],
    [{ type: 'empty' }],
    // KPIs
    [
      { type: 'string', value: 'Límite Total', style: 21 },
      { type: 'string', value: 'Gasto Total', style: 21 },
      { type: 'string', value: 'Disponible', style: 21 },
      { type: 'string', value: '% Ejecución', style: 21 },
    ],
    [
      { type: 'number', value: kpis.limiteTotal, style: 22 },
      { type: 'number', value: kpis.gastadoTotal, style: 22 },
      { type: 'number', value: kpis.disponibleTotal, style: 22 },
      { type: 'number', value: kpis.porcentajeEjecucionGlobal / 100, style: 24 },
    ],
    [{ type: 'empty' }],
    // Detalle
    [{ type: 'string', value: 'Detalle por Presupuesto', style: 3 }],
    [
      { type: 'string', value: 'Presupuesto', style: 4 },
      { type: 'string', value: 'Categoría Ref', style: 4 },
      { type: 'string', value: 'Límite (S/)', style: 6 },
      { type: 'string', value: 'Gastado (S/)', style: 6 },
      { type: 'string', value: 'Disponible (S/)', style: 6 },
      { type: 'string', value: '% Consumo', style: 6 },
      { type: 'string', value: 'Estado', style: 5 },
    ],
  ]

  items.forEach((p, idx) => {
    const isEven = idx % 2 === 0
    const estadoStyle = p.estado === 'excedido' ? 16 : p.estado === 'alerta' ? 18 : 15
    rows.push([
      { type: 'string', value: p.nombre, style: isEven ? 8 : 7 },
      { type: 'string', value: p.categoriaNombre || 'Sin categoría', style: isEven ? 8 : 7 },
      { type: 'number', value: p.limite, style: isEven ? 12 : 11 },
      { type: 'number', value: p.gastado, style: isEven ? 12 : 11 },
      { type: 'number', value: p.disponible, style: isEven ? 12 : 11 },
      { type: 'number', value: p.porcentaje / 100, style: isEven ? 14 : 13 },
      { type: 'string', value: p.estado.toUpperCase(), style: estadoStyle },
    ])
  })

  // Totales
  rows.push([
    { type: 'empty' },
    { type: 'string', value: 'TOTALES:', style: 19 },
    { type: 'number', value: kpis.limiteTotal, style: 20 },
    { type: 'number', value: kpis.gastadoTotal, style: 20 },
    { type: 'number', value: kpis.disponibleTotal, style: 20 },
    { type: 'number', value: kpis.porcentajeEjecucionGlobal / 100, style: 20 },
    { type: 'empty' },
  ])

  const dateSlug = new Date().toISOString().slice(0, 10)
  downloadXlsxFile(`reporte-presupuestos-${dateSlug}.xlsx`, 'Presupuestos', cols, rows)
}

// ==========================================
// 7. EXPORTAR REPORTE DE METAS
// ==========================================

export function exportReportMetasExcel(kpis: MetasKpis, items: MetaReportItem[]) {
  const now = new Date().toLocaleString('es-PE')

  const cols: XlsxCol[] = [
    { width: 24 },
    { width: 18 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
  ]

  const rows: XlsxRow[] = [
    [{ type: 'string', value: 'FinanzasTrack · Metas de Ahorro', style: 1 }],
    [{ type: 'string', value: `Generado: ${now}`, style: 2 }],
    [{ type: 'empty' }],
    // KPIs
    [
      { type: 'string', value: 'Objetivo Total', style: 21 },
      { type: 'string', value: 'Acumulado Total', style: 21 },
      { type: 'string', value: 'Faltante', style: 21 },
      { type: 'string', value: '% Progreso', style: 21 },
      { type: 'string', value: 'Metas Logradas', style: 21 },
    ],
    [
      { type: 'number', value: kpis.capitalObjetivoTotal, style: 22 },
      { type: 'number', value: kpis.capitalAcumuladoTotal, style: 22 },
      { type: 'number', value: kpis.capitalFaltanteTotal, style: 22 },
      { type: 'number', value: kpis.porcentajeProgresoGlobal / 100, style: 24 },
      { type: 'string', value: `${kpis.completadasCount} / ${kpis.totalMetas}`, style: 23 },
    ],
    [{ type: 'empty' }],
    [
      { type: 'string', value: 'Meta', style: 4 },
      { type: 'string', value: 'Categoría', style: 4 },
      { type: 'string', value: 'Objetivo (S/)', style: 6 },
      { type: 'string', value: 'Acumulado (S/)', style: 6 },
      { type: 'string', value: 'Faltante (S/)', style: 6 },
      { type: 'string', value: '% Avance', style: 6 },
      { type: 'string', value: 'Fecha Límite', style: 5 },
      { type: 'string', value: 'Estado', style: 5 },
    ],
  ]

  items.forEach((m, idx) => {
    const isEven = idx % 2 === 0
    const estadoStyle = m.estado === 'completada' ? 15 : 18
    rows.push([
      { type: 'string', value: m.nombre, style: isEven ? 8 : 7 },
      { type: 'string', value: m.categoriaReferenciaNombre || 'General', style: isEven ? 8 : 7 },
      { type: 'number', value: m.montoObjetivo, style: isEven ? 12 : 11 },
      { type: 'number', value: m.acumulado, style: isEven ? 12 : 11 },
      { type: 'number', value: m.faltante, style: isEven ? 12 : 11 },
      { type: 'number', value: m.porcentaje / 100, style: isEven ? 14 : 13 },
      { type: 'string', value: m.fechaLimite || '—', style: isEven ? 10 : 9 },
      { type: 'string', value: m.estado.toUpperCase(), style: estadoStyle },
    ])
  })

  const dateSlug = new Date().toISOString().slice(0, 10)
  downloadXlsxFile(`reporte-metas-${dateSlug}.xlsx`, 'Metas', cols, rows)
}

// ==========================================
// 8. EXPORTAR REPORTE DE RECURRENTES
// ==========================================

export function exportReportRecurrentesExcel(
  kpis: RecurrentesKpis,
  items: RecurrenteReportItem[],
  dateLabel?: string,
) {
  const now = new Date().toLocaleString('es-PE')

  const cols: XlsxCol[] = [
    { width: 24 },
    { width: 16 },
    { width: 20 },
    { width: 12 },
    { width: 16 },
    { width: 16 },
    { width: 14 },
  ]

  const rows: XlsxRow[] = [
    [{ type: 'string', value: 'FinanzasTrack · Compromisos Recurrentes', style: 1 }],
    [{ type: 'string', value: `Período: ${dateLabel || 'Mes Actual'} · Generado: ${now}`, style: 2 }],
    [{ type: 'empty' }],
    // KPIs
    [
      { type: 'string', value: 'Gastos Fijos/Mes', style: 21 },
      { type: 'string', value: 'Ingresos Fijos/Mes', style: 21 },
      { type: 'string', value: 'Balance Fijo Neto', style: 21 },
      { type: 'string', value: '% Al Día', style: 21 },
    ],
    [
      { type: 'number', value: kpis.gastosFijosMes, style: 22 },
      { type: 'number', value: kpis.ingresosFijosMes, style: 22 },
      { type: 'number', value: kpis.balanceFijoNeto, style: 22 },
      { type: 'number', value: kpis.porcentajePagado / 100, style: 24 },
    ],
    [{ type: 'empty' }],
    [
      { type: 'string', value: 'Nombre', style: 4 },
      { type: 'string', value: 'Tipo', style: 5 },
      { type: 'string', value: 'Categoría', style: 4 },
      { type: 'string', value: 'Día', style: 5 },
      { type: 'string', value: 'Monto Mes (S/)', style: 6 },
      { type: 'string', value: 'Pagado (S/)', style: 6 },
      { type: 'string', value: 'Estado', style: 5 },
    ],
  ]

  items.forEach((r, idx) => {
    const isEven = idx % 2 === 0
    const estadoStyle = r.estadoPago === 'pagado' ? 15 : r.estadoPago === 'parcial' ? 18 : 16
    rows.push([
      { type: 'string', value: r.nombre, style: isEven ? 8 : 7 },
      { type: 'string', value: r.tipo === 'income' ? 'Ingreso Fijo' : 'Gasto Fijo', style: isEven ? 10 : 9 },
      { type: 'string', value: r.categoriaNombre, style: isEven ? 8 : 7 },
      { type: 'string', value: `Día ${r.diaPago}`, style: isEven ? 10 : 9 },
      { type: 'number', value: r.montoMes, style: isEven ? 12 : 11 },
      { type: 'number', value: r.montoPagado, style: isEven ? 12 : 11 },
      { type: 'string', value: r.estadoPago.toUpperCase(), style: estadoStyle },
    ])
  })

  const dateSlug = new Date().toISOString().slice(0, 10)
  downloadXlsxFile(`reporte-recurrentes-${dateSlug}.xlsx`, 'Recurrentes', cols, rows)
}
