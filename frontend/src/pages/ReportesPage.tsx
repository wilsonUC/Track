import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchCategories, fetchTransactions } from '../api/finanzas'
import { ReportesCategoryTable } from '../components/reportes/ReportesCategoryTable'
import { ReportesDonutChart } from '../components/reportes/ReportesDonutChart'
import { ReportesHeader } from '../components/reportes/ReportesHeader'
import { ReportesMonthlyChart } from '../components/reportes/ReportesMonthlyChart'
import type { ReportFilter } from '../components/reportes/reportesTypes'
import {
  buildDonutSegments,
  downloadReportCsv,
  filterReportCategories,
  prepareReportData,
} from '../utils/reportesMetrics'

type OutletContext = {
  transactionsVersion: number
}

export function ReportesPage() {
  const { transactionsVersion } = useOutletContext<OutletContext>()
  const [filter, setFilter] = useState<ReportFilter>('todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [categoryRows, setCategoryRows] = useState<ReturnType<typeof prepareReportData>['categoryRows']>([])
  const [monthlyBars, setMonthlyBars] = useState<ReturnType<typeof prepareReportData>['monthlyBars']>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchTransactions(), fetchCategories()])
      .then(([transactions, categories]) => {
        if (cancelled) return
        const data = prepareReportData(transactions, categories)
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
  }, [transactionsVersion])

  const filteredCategories = useMemo(
    () => filterReportCategories(categoryRows, filter),
    [categoryRows, filter],
  )

  const donutSegments = useMemo(
    () => buildDonutSegments(filteredCategories),
    [filteredCategories],
  )

  function handleExport() {
    downloadReportCsv(filteredCategories, monthlyBars, filter)
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
      <ReportesHeader filter={filter} onFilterChange={setFilter} onExport={handleExport} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ReportesMonthlyChart filter={filter} data={monthlyBars} loading={loading} />
        <ReportesDonutChart filter={filter} segments={donutSegments} loading={loading} />
      </div>

      <ReportesCategoryTable filter={filter} categories={filteredCategories} loading={loading} />
    </section>
  )
}
