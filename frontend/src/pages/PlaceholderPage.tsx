import { sectionSubtitle, sectionTitle } from '../constants/sectionLabels'
import type { Section } from '../types/finance'

type PlaceholderPageProps = {
  section: Section
}

export function PlaceholderPage({ section }: PlaceholderPageProps) {
  return (
    <section className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto max-w-md">
        <p className="text-lg font-bold text-slate-800">{sectionTitle[section]}</p>
        <p className="mt-2 text-sm text-slate-600">{sectionSubtitle[section]}</p>
        <p className="mt-4 text-xs text-slate-400">
          Módulo en preparación. Aquí conectaremos listados, formularios o la IA cuando el backend esté listo.
        </p>
      </div>
    </section>
  )
}
