import { PiggyBank } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { fetchResumenAhorros } from '../api/ahorros'
import { fetchCategories } from '../api/finanzas'
import {
  asignarAhorroMeta,
  createMeta,
  desasignarAhorroMeta,
  fetchMetas,
  updateMeta,
} from '../api/metas'
import { AsignacionModal } from '../components/metas/AsignacionModal'
import { MetaModal } from '../components/metas/MetaModal'
import { MetasGrid } from '../components/metas/MetasGrid'
import { MetasSummaryCard } from '../components/metas/MetasSummaryCard'
import { sectionPaths } from '../constants/routes'
import { formatSoles } from '../utils/financeFormat'
import { mapMetaToCard, type MetaCardView } from '../utils/metasDisplay'

type OutletContext = {
  transactionsVersion: number
  bumpTransactions: () => void
  setSecondaryHeaderAction: (action: { label: string; onClick: () => void } | null) => void
}

type ModalMode = 'create' | 'edit'
type AsignacionMode = 'asignar' | 'desasignar'

export function MetasPage() {
  const { transactionsVersion, bumpTransactions, setSecondaryHeaderAction } =
    useOutletContext<OutletContext>()
  const [metas, setMetas] = useState<MetaCardView[]>([])
  const [libre, setLibre] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [montoObjetivo, setMontoObjetivo] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [categoriaReferenciaId, setCategoriaReferenciaId] = useState<number | ''>('')
  const [categoriasGasto, setCategoriasGasto] = useState<Awaited<ReturnType<typeof fetchCategories>>>([])
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const [asignModo, setAsignModo] = useState<AsignacionMode>('asignar')
  const [asignMeta, setAsignMeta] = useState<MetaCardView | null>(null)
  const [asignOpen, setAsignOpen] = useState(false)
  const [asignSaving, setAsignSaving] = useState(false)
  const [asignError, setAsignError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchMetas(), fetchCategories(), fetchResumenAhorros()])
      .then(([data, categories, resumen]) => {
        if (cancelled) return
        setMetas(data.map(mapMetaToCard))
        setCategoriasGasto(categories.filter((c) => c.tipo === 'expense'))
        setLibre(Number(resumen.libre))
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar las metas.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [transactionsVersion])

  const totalObjetivo = useMemo(() => metas.reduce((acc, m) => acc + m.objetivo, 0), [metas])
  const totalAcumulado = useMemo(() => metas.reduce((acc, m) => acc + m.acumulado, 0), [metas])
  const porcentajeGlobal =
    totalObjetivo > 0 ? Math.min(100, Math.round((totalAcumulado / totalObjetivo) * 100)) : 0

  const refrescarLibre = () => {
    fetchResumenAhorros()
      .then((r) => setLibre(Number(r.libre)))
      .catch(() => {})
  }

  const resetForm = () => {
    setNombre('')
    setMontoObjetivo('')
    setFechaLimite('')
    setCategoriaReferenciaId('')
    setEditingId(null)
    setModalError('')
  }

  const abrirModalCrear = () => {
    resetForm()
    setModalMode('create')
    setIsModalOpen(true)
  }

  const abrirModalEditar = (meta: MetaCardView) => {
    setModalMode('edit')
    setEditingId(meta.id)
    setNombre(meta.nombre)
    setMontoObjetivo(String(meta.objetivo))
    setFechaLimite(meta.fechaLimite ?? '')
    setCategoriaReferenciaId(meta.categoriaReferenciaId ?? '')
    setModalError('')
    setIsModalOpen(true)
  }

  const cerrarModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const abrirAsignacion = (meta: MetaCardView, modo: AsignacionMode) => {
    setAsignMeta(meta)
    setAsignModo(modo)
    setAsignError('')
    setAsignOpen(true)
  }

  const manejarAsignacion = async (monto: string) => {
    if (!asignMeta) return
    setAsignSaving(true)
    setAsignError('')
    try {
      const actualizado =
        asignModo === 'asignar'
          ? await asignarAhorroMeta(asignMeta.id, monto)
          : await desasignarAhorroMeta(asignMeta.id, monto)
      setMetas((prev) => prev.map((m) => (m.id === asignMeta.id ? mapMetaToCard(actualizado) : m)))
      setAsignOpen(false)
      refrescarLibre()
      bumpTransactions()
    } catch (err) {
      setAsignError(err instanceof Error ? err.message : 'No se pudo completar la operación.')
    } finally {
      setAsignSaving(false)
    }
  }

  const manejarGuardarMeta = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !montoObjetivo) return

    setSaving(true)
    setModalError('')
    try {
      const payload = {
        nombre: nombre.trim(),
        monto_objetivo: montoObjetivo,
        fecha_limite: fechaLimite || null,
        categoria_referencia: categoriaReferenciaId || null,
      }

      if (modalMode === 'edit' && editingId !== null) {
        const actualizado = await updateMeta(editingId, payload)
        setMetas((prev) => prev.map((m) => (m.id === editingId ? mapMetaToCard(actualizado) : m)))
      } else {
        const creado = await createMeta(payload)
        setMetas((prev) => [...prev, mapMetaToCard(creado)])
      }

      cerrarModal()
    } catch (err) {
      setModalError(
        err instanceof Error
          ? err.message
          : modalMode === 'edit'
            ? 'No se pudo actualizar la meta.'
            : 'No se pudo crear la meta. Revisa los datos.',
      )
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    setSecondaryHeaderAction({
      label: 'Nueva meta',
      onClick: abrirModalCrear,
    })
    return () => setSecondaryHeaderAction(null)
  }, [setSecondaryHeaderAction])

  return (
    <section className="space-y-6 text-slate-800">
      {loading && <p className="text-sm text-slate-500">Cargando metas…</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-indigo-800">
              <PiggyBank className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden />
              <span>
                Tienes <span className="font-bold">{formatSoles(libre)}</span> libres en Ahorros para
                asignar a metas.
              </span>
            </div>
            <Link
              to={sectionPaths.ahorros}
              className="shrink-0 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
            >
              Ir a Ahorros
            </Link>
          </div>

          <MetasSummaryCard
            totalAcumulado={totalAcumulado}
            totalObjetivo={totalObjetivo}
            porcentajeGlobal={porcentajeGlobal}
          />

          {metas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Aún no tienes metas. Crea una para empezar a ahorrar hacia un objetivo concreto.
            </p>
          ) : (
            <MetasGrid
              metas={metas}
              onAsignar={(m) => abrirAsignacion(m, 'asignar')}
              onDesasignar={(m) => abrirAsignacion(m, 'desasignar')}
              onEditar={abrirModalEditar}
            />
          )}
        </>
      )}

      <MetaModal
        open={isModalOpen}
        mode={modalMode}
        nombre={nombre}
        montoObjetivo={montoObjetivo}
        fechaLimite={fechaLimite}
        categoriaReferenciaId={categoriaReferenciaId}
        categoriasGasto={categoriasGasto}
        saving={saving}
        error={modalError}
        onNombreChange={setNombre}
        onMontoObjetivoChange={setMontoObjetivo}
        onFechaLimiteChange={setFechaLimite}
        onCategoriaReferenciaChange={setCategoriaReferenciaId}
        onClose={cerrarModal}
        onSubmit={manejarGuardarMeta}
      />

      <AsignacionModal
        open={asignOpen}
        mode={asignModo}
        meta={asignMeta}
        libre={libre}
        saving={asignSaving}
        error={asignError}
        onClose={() => setAsignOpen(false)}
        onSubmit={(monto) => void manejarAsignacion(monto)}
      />
    </section>
  )
}
