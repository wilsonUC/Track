import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Power, PowerOff } from 'lucide-react'
import { fetchCategories } from '../api/finanzas'
import {
  createPresupuesto,
  deletePresupuestoPermanente,
  fetchPresupuestos,
  reactivarPresupuesto,
  registrarGastoRapido,
  updatePresupuesto,
} from '../api/presupuestos'
import { PresupuestoModal } from '../components/presupuestos/PresupuestoModal'
import { ReactivarPresupuestoModal } from '../components/presupuestos/ReactivarPresupuestoModal'
import { EliminarPresupuestoModal } from '../components/presupuestos/EliminarPresupuestoModal'
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
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [categoriasGasto, setCategoriasGasto] = useState<Awaited<ReturnType<typeof fetchCategories>>>([])
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [registrandoId, setRegistrandoId] = useState<number | null>(null)
  const [procesandoId, setProcesandoId] = useState<number | null>(null)
  const [mostrarInactivos, setMostrarInactivos] = useState(false)

  const [isEliminarModalOpen, setIsEliminarModalOpen] = useState(false)
  const [presupuestoAEliminar, setPresupuestoAEliminar] = useState<PresupuestoCardView | null>(null)

  const [isReactivarModalOpen, setIsReactivarModalOpen] = useState(false)
  const [presupuestoAReactivar, setPresupuestoAReactivar] = useState<PresupuestoCardView | null>(null)
  const [reactivando, setReactivando] = useState(false)
  const [reactivarError, setReactivarError] = useState('')

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

    Promise.all([fetchPresupuestos(mesParam, mostrarInactivos), fetchCategories()])
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
  }, [transactionsVersion, fechaRef, mostrarInactivos])

  const totalLimite = useMemo(
    () =>
      presupuestos
        .filter((p) => p.activo && p.activoEnMes)
        .reduce((acc, p) => acc + p.limite, 0),
    [presupuestos],
  )
  const totalGastado = useMemo(
    () =>
      presupuestos
        .filter((p) => p.activo && p.activoEnMes)
        .reduce((acc, p) => acc + p.gastado, 0),
    [presupuestos],
  )
  const porcentajeGlobal = totalLimite > 0 ? Math.round((totalGastado / totalLimite) * 100) : 0

  const resetForm = () => {
    setNombre('')
    setLimite('')
    setMontoRapido('30')
    setCategoriaReferenciaId('')
    setFechaInicio('')
    setFechaFin('')
    setEditingId(null)
    setModalError('')
  }

  const abrirModalCrear = () => {
    resetForm()
    const anio = fechaRef.getFullYear()
    const mes = String(fechaRef.getMonth() + 1).padStart(2, '0')
    setFechaInicio(`${anio}-${mes}`)
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
    setFechaInicio(presupuesto.fechaInicio ? presupuesto.fechaInicio.slice(0, 7) : '')
    setFechaFin(presupuesto.fechaFin ? presupuesto.fechaFin.slice(0, 7) : '')
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

  const manejarAlternarActivo = async (id: number, nuevoEstadoActivo: boolean) => {
    if (!nuevoEstadoActivo) {
      if (
        !window.confirm(
          '¿Estás seguro de que deseas desactivar este presupuesto? Dejará de figurar en el cálculo activo, pero tus gastos previos se conservarán.'
        )
      ) {
        return
      }
    }
    setProcesandoId(id)
    setError('')
    try {
      const anio = fechaRef.getFullYear()
      const mes = String(fechaRef.getMonth() + 1).padStart(2, '0')
      const mesParam = `${anio}-${mes}-01`
      const actualizado = await updatePresupuesto(id, { activo: nuevoEstadoActivo }, mesParam)
      setPresupuestos((prev) =>
        prev.map((p) => (p.id === id ? mapPresupuestoToCard(actualizado) : p))
      )
      if (!nuevoEstadoActivo && !mostrarInactivos) {
        setPresupuestos((prev) => prev.filter((p) => p.id !== id))
      }
      bumpTransactions()
    } catch {
      setError(
        nuevoEstadoActivo
          ? 'No se pudo reactivar el presupuesto.'
          : 'No se pudo desactivar el presupuesto.'
      )
    } finally {
      setProcesandoId(null)
    }
  }

  const abrirModalReactivar = (presupuesto: PresupuestoCardView) => {
    setPresupuestoAReactivar(presupuesto)
    setReactivarError('')
    setIsReactivarModalOpen(true)
  }

  const manejarConfirmarReactivar = async (data: {
    fecha_inicio: string
    fecha_fin: string | null
    limite: string
    desvincular_transacciones: boolean
  }) => {
    if (!presupuestoAReactivar) return
    setReactivando(true)
    setReactivarError('')
    try {
      const anio = fechaRef.getFullYear()
      const mes = String(fechaRef.getMonth() + 1).padStart(2, '0')
      const mesParam = `${anio}-${mes}-01`
      const actualizado = await reactivarPresupuesto(
        presupuestoAReactivar.id,
        data,
        mesParam,
      )
      setPresupuestos((prev) =>
        prev.map((p) => (p.id === presupuestoAReactivar.id ? mapPresupuestoToCard(actualizado) : p)),
      )
      setIsReactivarModalOpen(false)
      setPresupuestoAReactivar(null)
      bumpTransactions()
    } catch (err: unknown) {
      let msg = 'No se pudo reactivar el presupuesto.'
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message)
          if (parsed?.error) msg = parsed.error
        } catch {
          msg = err.message || msg
        }
      }
      setReactivarError(msg)
    } finally {
      setReactivando(false)
    }
  }

  const abrirModalEliminar = (presupuesto: PresupuestoCardView) => {
    setPresupuestoAEliminar(presupuesto)
    setIsEliminarModalOpen(true)
  }

  const manejarConfirmarEliminar = async (
    id: number,
    modo?: 'eliminar_todo' | 'conservar_transacciones',
  ) => {
    await deletePresupuestoPermanente(id, modo)
    setPresupuestos((prev) => prev.filter((p) => p.id !== id))
    bumpTransactions()
  }

  const manejarGuardarPresupuesto = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !limite || !montoRapido) return

    setSaving(true)
    setModalError('')
    try {
      const anio = fechaRef.getFullYear()
      const mes = String(fechaRef.getMonth() + 1).padStart(2, '0')
      const mesParam = `${anio}-${mes}-01`

      const payload = {
        nombre: nombre.trim(),
        limite,
        monto_rapido: montoRapido,
        categoria_referencia: categoriaReferenciaId || null,
        fecha_inicio: fechaInicio ? `${fechaInicio}-01` : null,
        fecha_fin: fechaFin ? `${fechaFin}-01` : null,
      }

      if (modalMode === 'edit' && editingId !== null) {
        const actualizado = await updatePresupuesto(editingId, payload, mesParam)
        setPresupuestos((prev) =>
          prev.map((p) => (p.id === editingId ? mapPresupuestoToCard(actualizado) : p)),
        )
      } else {
        const creado = await createPresupuesto(payload, mesParam)
        setPresupuestos((prev) => [...prev, mapPresupuestoToCard(creado)])
      }

      cerrarModal()
    } catch (err) {
      let customError = ''
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message)
          if (parsed && typeof parsed === 'object') {
            const vals = Object.values(parsed)
            if (vals.length > 0) {
              customError = Array.isArray(vals[0]) ? vals[0].join(', ') : String(vals[0])
            }
          }
        } catch {
          // ignore
        }
      }
      setModalError(
        customError ||
          (modalMode === 'edit'
            ? 'No se pudo actualizar el presupuesto.'
            : 'No se pudo crear el presupuesto. Revisa los datos.'),
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

  const mesInicialStr = `${fechaRef.getFullYear()}-${String(fechaRef.getMonth() + 1).padStart(2, '0')}`

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

          <div className="flex items-center justify-end pr-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">
                Mostrar presupuestos desactivados
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={mostrarInactivos}
                onClick={() => setMostrarInactivos(!mostrarInactivos)}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                  mostrarInactivos ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span className="absolute left-1.5 flex h-4 w-4 items-center justify-center text-slate-400">
                  <PowerOff className="h-3.5 w-3.5" />
                </span>
                <span className="absolute right-1.5 flex h-4 w-4 items-center justify-center text-white/80">
                  <Power className="h-3.5 w-3.5" />
                </span>
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    mostrarInactivos ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {presupuestos.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              Aún no tienes presupuestos. Crea uno para apartar dinero de un gasto concreto.
            </p>
          ) : (
            <PresupuestosGrid
              presupuestos={presupuestos}
              onRegistrarGasto={registrarGasto}
              onEditar={abrirModalEditar}
              onAlternarActivo={manejarAlternarActivo}
              onReactivar={abrirModalReactivar}
              onEliminar={abrirModalEliminar}
              registrandoId={registrandoId}
              procesandoId={procesandoId}
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
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        categoriasGasto={categoriasGasto}
        saving={saving}
        error={modalError}
        onNombreChange={setNombre}
        onLimiteChange={setLimite}
        onMontoRapidoChange={setMontoRapido}
        onCategoriaReferenciaChange={setCategoriaReferenciaId}
        onFechaInicioChange={setFechaInicio}
        onFechaFinChange={setFechaFin}
        onClose={cerrarModal}
        onSubmit={manejarGuardarPresupuesto}
      />

      <ReactivarPresupuestoModal
        open={isReactivarModalOpen}
        presupuesto={presupuestoAReactivar}
        mesInicial={mesInicialStr}
        saving={reactivando}
        error={reactivarError}
        onClose={() => {
          setIsReactivarModalOpen(false)
          setPresupuestoAReactivar(null)
          setReactivarError('')
        }}
        onConfirm={manejarConfirmarReactivar}
      />

      <EliminarPresupuestoModal
        open={isEliminarModalOpen}
        presupuesto={presupuestoAEliminar}
        onClose={() => {
          setIsEliminarModalOpen(false)
          setPresupuestoAEliminar(null)
        }}
        onConfirm={manejarConfirmarEliminar}
      />
    </section>
  )
}
