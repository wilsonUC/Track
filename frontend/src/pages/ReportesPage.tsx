import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchCategories, fetchTransactions } from '../api/finanzas'
import { DateFilterToolbar } from '../components/filters/DateFilterToolbar'
import { ReportesCategoryTable } from '../components/reportes/ReportesCategoryTable'
import { ReportesDonutChart } from '../components/reportes/ReportesDonutChart'
import { ReportesHeader } from '../components/reportes/ReportesHeader'
import { ReportesMonthlyChart } from '../components/reportes/ReportesMonthlyChart'
import type { ReportFilter } from '../components/reportes/reportesTypes'
import { useDateFilter } from '../hooks/useDateFilter'
import {
  buildDonutSegments,
  downloadReportCsv,
  filterReportCategories,
  prepareReportData,
} from '../utils/reportesMetrics'
import { buildCategoryMap, enrichTransactions, filterByDateRange } from '../utils/dashboardMetrics'

type OutletContext = {
  transactionsVersion: number
}

export function ReportesPage() {
  const { transactionsVersion } = useOutletContext<OutletContext>()
  const [typeFilter, setTypeFilter] = useState<ReportFilter>('todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const dateFilter = useDateFilter({ defaultPreset: 'total' })

  const [categoryRows, setCategoryRows] = useState<ReturnType<typeof prepareReportData>['categoryRows']>([])
  const [monthlyBars, setMonthlyBars] = useState<ReturnType<typeof prepareReportData>['monthlyBars']>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchTransactions(), fetchCategories()])
      .then(([transactions, categories]) => {
        if (cancelled) return
        const categoryMap = buildCategoryMap(categories)
        const enriched = enrichTransactions(transactions, categoryMap)
        const filtered = filterByDateRange(enriched, dateFilter.range)
        const data = prepareReportData(filtered)
        setCategoryRows(data.categoryRows)
        setMonthlyBars(data.monthlyBars)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los datos del reporte.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [transactionsVersion, dateFilter.range])

  const filteredCategories = useMemo(
    () => filterReportCategories(categoryRows, typeFilter),
    [categoryRows, typeFilter],
  )

  const donutSegments = useMemo(
    () => buildDonutSegments(filteredCategories),
    [filteredCategories],
  )

  function handleExport() {
    downloadReportCsv(filteredCategories, monthlyBars, typeFilter, dateFilter.label)
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        {error}
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <DateFilterToolbar
        preset={dateFilter.preset}
        onPresetChange={dateFilter.setPreset}
        customStart={dateFilter.customStart}
        customEnd={dateFilter.customEnd}
        onCustomStartChange={dateFilter.setCustomStart}
        onCustomEndChange={dateFilter.setCustomEnd}
      />

      <ReportesHeader filter={typeFilter} onFilterChange={setTypeFilter} onExport={handleExport} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ReportesMonthlyChart filter={typeFilter} data={monthlyBars} loading={loading} />
        <ReportesDonutChart filter={typeFilter} segments={donutSegments} loading={loading} />
      </div>

      <ReportesCategoryTable filter={typeFilter} categories={filteredCategories} loading={loading} />
    </section>
  )
}
