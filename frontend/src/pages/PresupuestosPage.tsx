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
import { FiltroMesPresupuestos } from '../components/presupuestos/FiltroMesPresupuestos'
import type { PresupuestoCardView } from '../components/presupuestos/presupuestosTypes'
import { mapPresupuestoToCard } from '../utils/presupuestosDisplay'

type OutletContext = {
  transactionsVersion: number
  bumpTransactions: () => void
  setSecondaryHeaderAction: (action: { label: string; onClick: () => void } | null) => void
  setHeaderExtra?: (extra: React.ReactNode | null) => void
}

type ModalMode = 'create' | 'edit'

export function PresupuestosPage() {
  const { transactionsVersion, bumpTransactions, setSecondaryHeaderAction, setHeaderExtra } =
    useOutletContext<OutletContext>()
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
  const [fechaRef, setFechaRef] = useState<Date>(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

  const MESES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]

  const mesTexto = `${MESES[fechaRef.getMonth()]} ${fechaRef.getFullYear()}`

  // Determinación de período
  const { esMesActual, esMesPasado, esMesFuturo } = useMemo(() => {
    const hoy = new Date()
    const anioHoy = hoy.getFullYear()
    const mesHoy = hoy.getMonth()
    const anioRef = fechaRef.getFullYear()
    const mesRef = fechaRef.getMonth()

    const esActual = anioHoy === anioRef && mesHoy === mesRef
    const esPasado = anioRef < anioHoy || (anioRef === anioHoy && mesRef < mesHoy)
    const esFuturo = anioRef > anioHoy || (anioRef === anioHoy && mesRef > mesHoy)

    return { esMesActual: esActual, esMesPasado: esPasado, esMesFuturo: esFuturo }
  }, [fechaRef])

  useEffect(() => {
    if (!setHeaderExtra) return
    setHeaderExtra(
      <FiltroMesPresupuestos fechaRef={fechaRef} onChangeFecha={setFechaRef} />
    )
    return () => setHeaderExtra(null)
  }, [setHeaderExtra, fechaRef])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    const anio = fechaRef.getFullYear()
    const mes = String(fechaRef.getMonth() + 1).padStart(2, '0')
    const mesParam = `${anio}-${mes}-01`

    Promise.all([fetchPresupuestos(mesParam), fetchCategories()])
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
  }, [transactionsVersion, fechaRef])

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
    if (!esMesActual) return
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

  useEffect(() => {
    setSecondaryHeaderAction({
      label: 'Nuevo presupuesto',
      onClick: abrirModalCrear,
    })
    return () => setSecondaryHeaderAction(null)
  }, [setSecondaryHeaderAction])

  return (
    <section className="space-y-6 text-slate-800 dark:text-slate-100">
      {loading && presupuestos.length === 0 && <p className="text-sm text-slate-500">Cargando presupuestos…</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {(!loading || presupuestos.length > 0) && (
        <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
          <PresupuestosSummaryCard
            totalGastado={totalGastado}
            totalLimite={totalLimite}
            porcentajeGlobal={porcentajeGlobal}
            mesLabel={mesTexto}
          />

          {presupuestos.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              Aún no tienes presupuestos. Crea uno para apartar dinero de un gasto concreto.
            </p>
          ) : (
            <PresupuestosGrid
              presupuestos={presupuestos}
              onRegistrarGasto={registrarGasto}
              onEditar={abrirModalEditar}
              registrandoId={registrandoId}
              esMesActual={esMesActual}
              esMesPasado={esMesPasado}
              esMesFuturo={esMesFuturo}
            />
          )}
        </div>
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
