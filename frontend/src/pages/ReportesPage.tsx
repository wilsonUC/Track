import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchCategories, fetchTransactions, type ApiCategory, type ApiTransaction } from '../api/finanzas'
import { fetchPresupuestos, type ApiPresupuesto } from '../api/presupuestos'
import { fetchMetas, type ApiMeta } from '../api/metas'
import { fetchAhorros, fetchResumenAhorros, type ApiAhorro, type ResumenAhorros } from '../api/ahorros'
import { fetchRecurrentes, type ApiRecurrente } from '../api/recurrentes'
import { DateFilterToolbar } from '../components/filters/DateFilterToolbar'
import { ReportesTabSelector } from '../components/reportes/ReportesTabSelector'
import { ReporteGeneralKpis } from '../components/reportes/general/ReporteGeneralKpis'
import { ReportesDonutChart } from '../components/reportes/ReportesDonutChart'
import { ReportesMonthlyChart } from '../components/reportes/ReportesMonthlyChart'
import { ReportesCategoryTable } from '../components/reportes/ReportesCategoryTable'
import { ReporteAhorrosKpis } from '../components/reportes/ahorros/ReporteAhorrosKpis'
import { ReporteAhorrosChart } from '../components/reportes/ahorros/ReporteAhorrosChart'
import { ReporteAhorrosTable } from '../components/reportes/ahorros/ReporteAhorrosTable'
import { ReportePresupuestosKpis } from '../components/reportes/presupuestos/ReportePresupuestosKpis'
import { ReportePresupuestosChart } from '../components/reportes/presupuestos/ReportePresupuestosChart'
import { ReportePresupuestosTable } from '../components/reportes/presupuestos/ReportePresupuestosTable'
import { ReporteMetasKpis } from '../components/reportes/metas/ReporteMetasKpis'
import { ReporteMetasChart } from '../components/reportes/metas/ReporteMetasChart'
import { ReporteMetasTable } from '../components/reportes/metas/ReporteMetasTable'
import { ReporteRecurrentesKpis } from '../components/reportes/recurrentes/ReporteRecurrentesKpis'
import { ReporteRecurrentesChart } from '../components/reportes/recurrentes/ReporteRecurrentesChart'
import { ReporteRecurrentesTable } from '../components/reportes/recurrentes/ReporteRecurrentesTable'
import type { MetaReportFilter, ReportFilter, ReportTab } from '../components/reportes/reportesTypes'
import { ReportesMonthHeader } from '../components/reportes/ReportesMonthHeader'
import { ReportesMetasHeader } from '../components/reportes/metas/ReportesMetasHeader'
import { useDateFilter } from '../hooks/useDateFilter'
import {
  buildDonutSegments,
  calculateAhorrosReport,
  calculateGeneralKpis,
  calculateMetasReport,
  calculatePresupuestosReport,
  calculateRecurrentesReport,
  downloadAhorrosCsv,
  downloadMetasCsv,
  downloadPresupuestosCsv,
  downloadRecurrentesCsv,
  downloadReportCsv,
  filterReportCategories,
  prepareReportData,
} from '../utils/reportesMetrics'
import { buildCategoryMap, enrichTransactions, filterByDateRange } from '../utils/dashboardMetrics'

type OutletContext = {
  transactionsVersion: number
  setHeaderExtra?: (extra: React.ReactNode | null) => void
}

const GENERAL_FILTER_OPTIONS: { id: ReportFilter; label: string }[] = [
  { id: 'todos', label: 'Todo' },
  { id: 'ingresos', label: 'Ingresos' },
  { id: 'gastos', label: 'Gastos' },
]

export function ReportesPage() {
  const { transactionsVersion, setHeaderExtra } = useOutletContext<OutletContext>()
  const [activeTab, setActiveTab] = useState<ReportTab>('general')
  const [generalFilter, setGeneralFilter] = useState<ReportFilter>('todos')
  const [metaFilter, setMetaFilter] = useState<MetaReportFilter>('todas')
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')

  const dateFilter = useDateFilter({ defaultPreset: 'month' })

  // State data
  const [transactions, setTransactions] = useState<ApiTransaction[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [presupuestos, setPresupuestos] = useState<ApiPresupuesto[]>([])
  const [metas, setMetas] = useState<ApiMeta[]>([])
  const [ahorros, setAhorros] = useState<ApiAhorro[]>([])
  const [resumenAhorros, setResumenAhorros] = useState<ResumenAhorros | null>(null)
  const [recurrentes, setRecurrentes] = useState<ApiRecurrente[]>([])

  const mesIso = useMemo(() => {
    const d = dateFilter.refDate
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  }, [dateFilter.refDate])

  // Carga inicial y recarga completa cuando cambian transacciones
  useEffect(() => {
    let cancelled = false
    setError('')

    Promise.all([
      fetchTransactions(),
      fetchCategories(),
      fetchPresupuestos(mesIso),
      fetchMetas(),
      fetchAhorros(),
      fetchResumenAhorros().catch(() => null),
      fetchRecurrentes(mesIso),
    ])
      .then(([txs, cats, pres, mts, ahs, resAh, recs]) => {
        if (cancelled) return
        setTransactions(txs)
        setCategories(cats)
        setPresupuestos(pres)
        setMetas(mts)
        setAhorros(ahs)
        setResumenAhorros(resAh)
        setRecurrentes(recs)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los datos de los reportes.')
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [transactionsVersion])

  // Actualización fluida sin parpadeos cuando cambia el mes en el selector
  useEffect(() => {
    if (initialLoading) return
    let cancelled = false

    Promise.all([
      fetchPresupuestos(mesIso),
      fetchRecurrentes(mesIso),
    ])
      .then(([pres, recs]) => {
        if (cancelled) return
        setPresupuestos(pres)
        setRecurrentes(recs)
      })
      .catch(() => {
        // En caso de error silencioso mantenemos los datos anteriores sin romper la pantalla
      })

    return () => {
      cancelled = true
    }
  }, [mesIso])

  // Process transactions with date filter for General and Ahorros
  const { filteredEnriched, allEnriched } = useMemo(() => {
    const categoryMap = buildCategoryMap(categories)
    const enr = enrichTransactions(transactions, categoryMap)
    const filt = filterByDateRange(enr, dateFilter.range)
    return { filteredEnriched: filt, allEnriched: enr }
  }, [transactions, categories, dateFilter.range])

  // 1. General Metrics
  const generalData = useMemo(() => {
    const data = prepareReportData(filteredEnriched, allEnriched, dateFilter.refDate)
    const kpis = calculateGeneralKpis(filteredEnriched)
    const filteredCats = filterReportCategories(data.categoryRows, generalFilter)
    const donut = buildDonutSegments(filteredCats)
    return {
      kpis,
      categoryRows: filteredCats,
      monthlyBars: data.monthlyBars,
      donutSegments: donut,
    }
  }, [filteredEnriched, allEnriched, generalFilter, dateFilter.refDate])

  // 2. Ahorros Metrics
  const ahorrosData = useMemo(() => {
    return calculateAhorrosReport(ahorros, resumenAhorros, filteredEnriched, dateFilter.refDate)
  }, [ahorros, resumenAhorros, filteredEnriched, dateFilter.refDate])

  // 3. Presupuestos Metrics
  const presupuestosData = useMemo(() => {
    return calculatePresupuestosReport(presupuestos)
  }, [presupuestos])

  // 4. Metas Metrics
  const metasData = useMemo(() => {
    return calculateMetasReport(metas, metaFilter)
  }, [metas, metaFilter])

  // 5. Recurrentes Metrics
  const recurrentesData = useMemo(() => {
    return calculateRecurrentesReport(recurrentes)
  }, [recurrentes])

  // Export handler
  function handleExport() {
    switch (activeTab) {
      case 'general':
        downloadReportCsv(
          generalData.categoryRows,
          generalData.monthlyBars,
          generalFilter,
          dateFilter.label,
        )
        break
      case 'ahorros':
        downloadAhorrosCsv(
          ahorrosData.kpis,
          ahorrosData.rows,
          ahorrosData.composition,
          dateFilter.label,
        )
        break
      case 'presupuestos':
        downloadPresupuestosCsv(presupuestosData.kpis, presupuestosData.items, dateFilter.label)
        break
      case 'metas':
        downloadMetasCsv(metasData.kpis, metasData.items)
        break
      case 'recurrentes':
        downloadRecurrentesCsv(recurrentesData.kpis, recurrentesData.items, dateFilter.label)
        break
    }
  }

  // Header Extra adaptado dinámicamente según la sección activa
  useEffect(() => {
    if (!setHeaderExtra) return

    if (activeTab === 'general' || activeTab === 'ahorros') {
      setHeaderExtra(
        <DateFilterToolbar
          preset={dateFilter.preset}
          onPresetChange={dateFilter.setPreset}
          customStart={dateFilter.customStart}
          customEnd={dateFilter.customEnd}
          onCustomStartChange={dateFilter.setCustomStart}
          onCustomEndChange={dateFilter.setCustomEnd}
          onPrevPeriod={dateFilter.prevPeriod}
          onNextPeriod={dateFilter.nextPeriod}
          onResetToCurrent={dateFilter.resetToCurrent}
          isCurrentPeriod={dateFilter.isCurrentPeriod}
          periodLabel={dateFilter.periodLabel}
        />,
      )
    } else if (activeTab === 'presupuestos' || activeTab === 'recurrentes') {
      setHeaderExtra(
        <ReportesMonthHeader
          refDate={dateFilter.refDate}
          onPrevMonth={dateFilter.prevPeriod}
          onNextMonth={dateFilter.nextPeriod}
          onResetToCurrent={dateFilter.resetToCurrent}
          isCurrentMonth={dateFilter.isCurrentPeriod}
        />,
      )
    } else if (activeTab === 'metas') {
      setHeaderExtra(
        <ReportesMetasHeader
          filter={metaFilter}
          onFilterChange={setMetaFilter}
          kpis={metasData.kpis}
        />,
      )
    }

    return () => setHeaderExtra(null)
  }, [
    setHeaderExtra,
    activeTab,
    metaFilter,
    metasData.kpis,
    dateFilter.preset,
    dateFilter.customStart,
    dateFilter.customEnd,
    dateFilter.isCurrentPeriod,
    dateFilter.periodLabel,
    dateFilter.refDate,
    dateFilter.setPreset,
    dateFilter.setCustomStart,
    dateFilter.setCustomEnd,
    dateFilter.prevPeriod,
    dateFilter.nextPeriod,
    dateFilter.resetToCurrent,
  ])

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {error}
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {/* Selector de Sección y Exportación */}
      <ReportesTabSelector
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExport={handleExport}
        exportLabel={`Exportar ${
          activeTab === 'general'
            ? 'General'
            : activeTab === 'ahorros'
              ? 'Ahorros'
              : activeTab === 'presupuestos'
                ? 'Presupuestos'
                : activeTab === 'metas'
                  ? 'Metas'
                  : 'Recurrentes'
        } CSV`}
      />

      {/* =========================================
          1. VISTA GENERAL
         ========================================= */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Tarjetas KPI */}
          <ReporteGeneralKpis kpis={generalData.kpis} loading={initialLoading} />

          {/* Filtro específico de ingresos/gastos */}
          <div className="flex items-center justify-between">
            <div
              className="inline-flex rounded-full border border-slate-200/80 bg-white p-1 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80"
              role="group"
              aria-label="Filtrar tipo de reporte general"
            >
              {GENERAL_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGeneralFilter(opt.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 sm:px-5 ${
                    generalFilter === opt.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ReportesMonthlyChart
              filter={generalFilter}
              data={generalData.monthlyBars}
              loading={initialLoading}
            />
            <ReportesDonutChart
              filter={generalFilter}
              segments={generalData.donutSegments}
              loading={initialLoading}
            />
          </div>

          {/* Tabla de categorías */}
          <ReportesCategoryTable
            filter={generalFilter}
            categories={generalData.categoryRows}
            loading={initialLoading}
          />
        </div>
      )}

      {/* =========================================
          2. VISTA AHORROS
         ========================================= */}
      {activeTab === 'ahorros' && (
        <div className="space-y-6">
          <ReporteAhorrosKpis kpis={ahorrosData.kpis} loading={initialLoading} />
          <ReporteAhorrosChart
            composition={ahorrosData.composition}
            monthlyPoints={ahorrosData.monthlyPoints}
            loading={initialLoading}
          />
          <ReporteAhorrosTable movimientos={ahorrosData.rows} loading={initialLoading} />
        </div>
      )}

      {/* =========================================
          3. VISTA PRESUPUESTOS
         ========================================= */}
      {activeTab === 'presupuestos' && (
        <div className="space-y-6">
          <ReportePresupuestosKpis kpis={presupuestosData.kpis} loading={initialLoading} />
          <ReportePresupuestosChart items={presupuestosData.items} loading={initialLoading} />
          <ReportePresupuestosTable items={presupuestosData.items} loading={initialLoading} />
        </div>
      )}

      {/* =========================================
          4. VISTA METAS
         ========================================= */}
      {activeTab === 'metas' && (
        <div className="space-y-6">
          <ReporteMetasKpis kpis={metasData.kpis} loading={initialLoading} />
          <ReporteMetasChart items={metasData.items} loading={initialLoading} />
          <ReporteMetasTable items={metasData.items} loading={initialLoading} />
        </div>
      )}

      {/* =========================================
          5. VISTA RECURRENTES
         ========================================= */}
      {activeTab === 'recurrentes' && (
        <div className="space-y-6">
          <ReporteRecurrentesKpis kpis={recurrentesData.kpis} loading={initialLoading} />
          <ReporteRecurrentesChart items={recurrentesData.items} loading={initialLoading} />
          <ReporteRecurrentesTable items={recurrentesData.items} loading={initialLoading} />
        </div>
      )}
    </section>
  )
}
