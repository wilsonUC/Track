import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchCategories } from '../api/finanzas'
import {
  createPresupuesto,
  fetchPresupuestos,
  registrarGastoRapido,
  updatePresupuesto,
} from '../api/presupuestos'
import { PresupuestoModal } from '../components/presupuestos/PresupuestoModal'
import { PresupuestosGrid } from '../components/presupuestos/PresupuestosGrid'
import { PresupuestosSummaryCard } from '../components/presupuestos/PresupuestosSummaryCard'
import { PresupuestosToolbar } from '../components/presupuestos/PresupuestosToolbar'
import type { PresupuestoCardView } from '../components/presupuestos/presupuestosTypes'
import { mapPresupuestoToCard } from '../utils/presupuestosDisplay'

type OutletContext = {
  transactionsVersion: number
  bumpTransactions: () => void
}

type ModalMode = 'create' | 'edit'

export function PresupuestosPage() {
  const { transactionsVersion, bumpTransactions } = useOutletContext<OutletContext>()
  const [presupuestos, setPresupuestos] = useState<PresupuestoCardView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [limite, setLimite] = useState('')
  const [montoRapido, setMontoRapido] = useState('30')
  const [categoriaReferenciaId, setCategoriaReferenciaId] = useState<number | ''>('')
  const [categoriasGasto, setCategoriasGasto] = useState<Awaited<ReturnType<typeof fetchCategories>>>([])
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [registrandoId, setRegistrandoId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchPresupuestos(), fetchCategories()])
      .then(([data, categories]) => {
        if (cancelled) return
        setPresupuestos(data.map(mapPresupuestoToCard))
        setCategoriasGasto(categories.filter((c) => c.tipo === 'expense'))
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los presupuestos.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [transactionsVersion])

  const totalLimite = useMemo(
    () => presupuestos.reduce((acc, p) => acc + p.limite, 0),
    [presupuestos],
  )
  const totalGastado = useMemo(
    () => presupuestos.reduce((acc, p) => acc + p.gastado, 0),
    [presupuestos],
  )
  const porcentajeGlobal = totalLimite > 0 ? Math.round((totalGastado / totalLimite) * 100) : 0

  const resetForm = () => {
    setNombre('')
    setLimite('')
    setMontoRapido('30')
    setCategoriaReferenciaId('')
    setEditingId(null)
    setModalError('')
  }

  const abrirModalCrear = () => {
    resetForm()
    setModalMode('create')
    setIsModalOpen(true)
  }

  const abrirModalEditar = (presupuesto: PresupuestoCardView) => {
    setModalMode('edit')
    setEditingId(presupuesto.id)
    setNombre(presupuesto.nombre)
    setLimite(String(presupuesto.limite))
    setMontoRapido(String(presupuesto.montoRapido))
    setCategoriaReferenciaId(presupuesto.categoriaReferenciaId ?? '')
    setModalError('')
    setIsModalOpen(true)
  }

  const cerrarModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const registrarGasto = async (id: number) => {
    setRegistrandoId(id)
    try {
      const actualizado = await registrarGastoRapido(id)
      setPresupuestos((prev) =>
        prev.map((p) => (p.id === id ? mapPresupuestoToCard(actualizado) : p)),
      )
      bumpTransactions()
    } catch {
      setError('No se pudo registrar el gasto.')
    } finally {
      setRegistrandoId(null)
    }
  }

  const manejarGuardarPresupuesto = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !limite || !montoRapido) return

    setSaving(true)
    setModalError('')
    try {
      const payload = {
        nombre: nombre.trim(),
        limite,
        monto_rapido: montoRapido,
        categoria_referencia: categoriaReferenciaId || null,
      }

      if (modalMode === 'edit' && editingId !== null) {
        const actualizado = await updatePresupuesto(editingId, payload)
        setPresupuestos((prev) =>
          prev.map((p) => (p.id === editingId ? mapPresupuestoToCard(actualizado) : p)),
        )
      } else {
        const creado = await createPresupuesto(payload)
        setPresupuestos((prev) => [...prev, mapPresupuestoToCard(creado)])
      }

      cerrarModal()
    } catch {
      setModalError(
        modalMode === 'edit'
          ? 'No se pudo actualizar el presupuesto.'
          : 'No se pudo crear el presupuesto. Revisa los datos.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6 text-slate-800">
      <PresupuestosToolbar onNuevoPresupuesto={abrirModalCrear} />

      {loading && <p className="text-sm text-slate-500">Cargando presupuestos…</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !error && (
        <>
          <PresupuestosSummaryCard
            totalGastado={totalGastado}
            totalLimite={totalLimite}
            porcentajeGlobal={porcentajeGlobal}
          />

          {presupuestos.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Aún no tienes presupuestos. Crea uno para apartar dinero de un gasto concreto.
            </p>
          ) : (
            <PresupuestosGrid
              presupuestos={presupuestos}
              onRegistrarGasto={registrarGasto}
              onEditar={abrirModalEditar}
              registrandoId={registrandoId}
            />
          )}
        </>
      )}

      <PresupuestoModal
        open={isModalOpen}
        mode={modalMode}
        nombre={nombre}
        limite={limite}
        montoRapido={montoRapido}
        categoriaReferenciaId={categoriaReferenciaId}
        categoriasGasto={categoriasGasto}
        saving={saving}
        error={modalError}
        onNombreChange={setNombre}
        onLimiteChange={setLimite}
        onMontoRapidoChange={setMontoRapido}
        onCategoriaReferenciaChange={setCategoriaReferenciaId}
        onClose={cerrarModal}
        onSubmit={manejarGuardarPresupuesto}
      />
    </section>
  )
}
