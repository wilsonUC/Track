import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchCategories } from '../api/finanzas'
import { createMeta, fetchMetas, registrarAporteMeta, updateMeta } from '../api/metas'
import { MetaModal } from '../components/metas/MetaModal'
import { MetasGrid } from '../components/metas/MetasGrid'
import { MetasSummaryCard } from '../components/metas/MetasSummaryCard'
import { MetasToolbar } from '../components/metas/MetasToolbar'
import { mapMetaToCard, type MetaCardView } from '../utils/metasDisplay'

type OutletContext = {
  transactionsVersion: number
  bumpTransactions: () => void
}

type ModalMode = 'create' | 'edit'

export function MetasPage() {
  const { transactionsVersion, bumpTransactions } = useOutletContext<OutletContext>()
  const [metas, setMetas] = useState<MetaCardView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [montoObjetivo, setMontoObjetivo] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [montoRapido, setMontoRapido] = useState('100')
  const [categoriaReferenciaId, setCategoriaReferenciaId] = useState<number | ''>('')
  const [categoriasGasto, setCategoriasGasto] = useState<Awaited<ReturnType<typeof fetchCategories>>>([])
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [registrandoId, setRegistrandoId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchMetas(), fetchCategories()])
      .then(([data, categories]) => {
        if (cancelled) return
        setMetas(data.map(mapMetaToCard))
        setCategoriasGasto(categories.filter((c) => c.tipo === 'expense'))
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

  const resetForm = () => {
    setNombre('')
    setMontoObjetivo('')
    setFechaLimite('')
    setMontoRapido('100')
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
    setMontoRapido(String(meta.montoRapido))
    setCategoriaReferenciaId(meta.categoriaReferenciaId ?? '')
    setModalError('')
    setIsModalOpen(true)
  }

  const cerrarModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const registrarAporte = async (id: number) => {
    setRegistrandoId(id)
    try {
      const actualizado = await registrarAporteMeta(id)
      setMetas((prev) => prev.map((m) => (m.id === id ? mapMetaToCard(actualizado) : m)))
      bumpTransactions()
    } catch {
      setError('No se pudo registrar el ahorro.')
    } finally {
      setRegistrandoId(null)
    }
  }

  const manejarGuardarMeta = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !montoObjetivo || !montoRapido) return

    setSaving(true)
    setModalError('')
    try {
      const payload = {
        nombre: nombre.trim(),
        monto_objetivo: montoObjetivo,
        monto_rapido: montoRapido,
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
    } catch {
      setModalError(
        modalMode === 'edit'
          ? 'No se pudo actualizar la meta.'
          : 'No se pudo crear la meta. Revisa los datos.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6 text-slate-800">
      <MetasToolbar onNuevaMeta={abrirModalCrear} />

      {loading && <p className="text-sm text-slate-500">Cargando metas…</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !error && (
        <>
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
              onRegistrarAporte={registrarAporte}
              onEditar={abrirModalEditar}
              registrandoId={registrandoId}
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
        montoRapido={montoRapido}
        categoriaReferenciaId={categoriaReferenciaId}
        categoriasGasto={categoriasGasto}
        saving={saving}
        error={modalError}
        onNombreChange={setNombre}
        onMontoObjetivoChange={setMontoObjetivo}
        onFechaLimiteChange={setFechaLimite}
        onMontoRapidoChange={setMontoRapido}
        onCategoriaReferenciaChange={setCategoriaReferenciaId}
        onClose={cerrarModal}
        onSubmit={manejarGuardarMeta}
      />
    </section>
  )
}
