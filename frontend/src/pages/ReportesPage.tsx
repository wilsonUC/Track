import { useMemo, useState } from 'react'
import { ReportesCategoryTable } from '../components/reportes/ReportesCategoryTable'
import { ReportesDonutChart } from '../components/reportes/ReportesDonutChart'
import { ReportesHeader } from '../components/reportes/ReportesHeader'
import { ReportesMonthlyChart } from '../components/reportes/ReportesMonthlyChart'
import { filterReportCategories, mockMonthlyBars, mockReportCategories } from '../components/reportes/reportesMockData'
import type { ReportFilter } from '../components/reportes/reportesTypes'

export function ReportesPage() {
  const [filter, setFilter] = useState<ReportFilter>('todos')

  const categories = useMemo(
    () => filterReportCategories(mockReportCategories, filter),
    [filter],
  )

  function handleExport() {
    alert(`Generando reporte en formato PDF/Excel con el filtro activo: [${filter.toUpperCase()}]...`)
  }

  return (
    <section className="space-y-6">
      <ReportesHeader filter={filter} onFilterChange={setFilter} onExport={handleExport} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ReportesMonthlyChart filter={filter} data={mockMonthlyBars} />
        <ReportesDonutChart filter={filter} />
      </div>

      <ReportesCategoryTable filter={filter} categories={categories} />
    </section>
  )
}
