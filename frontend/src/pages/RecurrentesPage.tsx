import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Power, PowerOff } from 'lucide-react'
import { fetchCategories, deleteTransaction } from '../api/finanzas'
import {
  createRecurrente,
  desmarcarPagoRecurrente,
  fetchRecurrentes,
  registrarPagoRecurrente,
  updateRecurrente,
  fetchCuentasAtrasadas,
  type ApiCuentasAtrasadas,
  type ApiCuentasAtrasadasItem,
} from '../api/recurrentes'
import { RecurrenteModal } from '../components/recurrentes/RecurrenteModal'
import { AbonoRecurrenteModal } from '../components/recurrentes/AbonoRecurrenteModal'
import { RecurrentesGrid } from '../components/recurrentes/RecurrentesGrid'
import { RecurrentesSummaryCard } from '../components/recurrentes/RecurrentesSummaryCard'
import { ResumenCuentasAtrasadas } from '../components/recurrentes/ResumenCuentasAtrasadas'
import { FiltroMesRecurrentes } from '../components/recurrentes/FiltroMesRecurrentes'
import type { RecurrenteCardView } from '../components/recurrentes/recurrentesTypes'
import { mapRecurrenteToCard } from '../utils/recurrentesDisplay'

type OutletContext = {
  transactionsVersion: number
  bumpTransactions: () => void
  setSecondaryHeaderAction: (action: { label: string; onClick: () => void } | null) => void
}

type ModalMode = 'create' | 'edit'

export function RecurrentesPage() {
  const { transactionsVersion, bumpTransactions, setSecondaryHeaderAction } =
    useOutletContext<OutletContext>()
  const [recurrentes, setRecurrentes] = useState<RecurrenteCardView[]>([])
  const [categorias, setCategorias] = useState<Awaited<ReturnType<typeof fetchCategories>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tipo, setTipo] = useState<'income' | 'expense'>('expense')
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [diaPago, setDiaPago] = useState('5')
  const [categoriaId, setCategoriaId] = useState<number | ''>('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [permiteParciales, setPermiteParciales] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false)
  const [abonoRecurrente, setAbonoRecurrente] = useState<RecurrenteCardView | null>(null)
  const [abonoSaving, setAbonoSaving] = useState(false)
  const [abonoError, setAbonoError] = useState('')

  const [fechaRef, setFechaRef] = useState<Date>(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [cuentasAtrasadas, setCuentasAtrasadas] = useState<ApiCuentasAtrasadas | null>(null)
  const [procesandoAtrasadaId, setProcesandoAtrasadaId] = useState<string | null>(null)
  const [mostrarInactivos, setMostrarInactivos] = useState(false)

  const formatIsoDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    const mesIso = formatIsoDate(fechaRef)

    Promise.all([
      fetchRecurrentes(mesIso, mostrarInactivos),
      fetchCuentasAtrasadas(),
      fetchCategories(),
    ])
      .then(([data, atrasadasData, cats]) => {
        if (cancelled) return
        setRecurrentes(data.map(mapRecurrenteToCard))
        setCuentasAtrasadas(atrasadasData)
        setCategorias(cats)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los recurrentes.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [transactionsVersion, fechaRef, mostrarInactivos])

  const visibleRecurrentes = useMemo(() => {
    return recurrentes.filter(
      (r) => r.estadoPeriodo !== 'no_iniciado' && r.estadoPeriodo !== 'finalizado'
    )
  }, [recurrentes])

  const gastos = useMemo(() => visibleRecurrentes.filter((r) => r.tipo === 'expense'), [visibleRecurrentes])
  const ingresos = useMemo(() => visibleRecurrentes.filter((r) => r.tipo === 'income'), [visibleRecurrentes])

  const totalPendienteGastos = useMemo(
    () => gastos.filter((r) => r.activoEnMes && !r.registradoMes).reduce((acc, r) => acc + r.monto, 0),
    [gastos],
  )

  const totalPendienteIngresos = useMemo(
    () => ingresos.filter((r) => r.activoEnMes && !r.registradoMes).reduce((acc, r) => acc + r.monto, 0),
    [ingresos],
  )

  const resetForm = () => {
    setNombre('')
    setMonto('')
    setDiaPago('5')
    setCategoriaId('')
    setFechaInicio('')
    setFechaFin('')
    setTipo('expense')
    setPermiteParciales(false)
    setEditingId(null)
    setModalError('')
  }

  const abrirModalCrear = () => {
    resetForm()
    setModalMode('create')
    setIsModalOpen(true)
  }

  const abrirModalEditar = (recurrente: RecurrenteCardView) => {
    setModalMode('edit')
    setEditingId(recurrente.id)
    setTipo(recurrente.tipo)
    setNombre(recurrente.nombre)
    setMonto(String(recurrente.monto))
    setDiaPago(String(recurrente.diaPago))
    setCategoriaId(recurrente.categoriaId)
    setFechaInicio(recurrente.fechaInicio ? recurrente.fechaInicio.slice(0, 7) : '')
    setFechaFin(recurrente.fechaFin ? recurrente.fechaFin.slice(0, 7) : '')
    setPermiteParciales(recurrente.permiteParciales)
    setModalError('')
    setIsModalOpen(true)
  }

  const cerrarModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const manejarCambioTipo = (nuevoTipo: 'income' | 'expense') => {
    setTipo(nuevoTipo)
    setCategoriaId('')
  }

  const alternarPago = async (id: number) => {
    const recurrente = recurrentes.find((r) => r.id === id)
    if (!recurrente) return

    const mesIso = formatIsoDate(fechaRef)

    // Si permite abonos parciales y no está completamente registrado
    if (recurrente.permiteParciales && !recurrente.registradoMes) {
      setAbonoRecurrente(recurrente)
      setAbonoError('')
      setIsAbonoModalOpen(true)
      return
    }

    setProcesandoId(id)
    setError('')
    try {
      const actualizado = recurrente.registradoMes
        ? await desmarcarPagoRecurrente(id, mesIso)
        : await registrarPagoRecurrente(id, undefined, mesIso)
      setRecurrentes((prev) => prev.map((r) => (r.id === id ? mapRecurrenteToCard(actualizado) : r)))
      
      const atrasadasData = await fetchCuentasAtrasadas()
      setCuentasAtrasadas(atrasadasData)
      
      bumpTransactions()
    } catch {
      setError('No se pudo actualizar el estado del recurrente.')
    } finally {
      setProcesandoId(null)
    }
  }

  const manejarEliminarAbono = async (transactionId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este abono?')) {
      return
    }
    setError('')
    try {
      await deleteTransaction(transactionId)
      const mesIso = formatIsoDate(fechaRef)
      const data = await fetchRecurrentes(mesIso, mostrarInactivos)
      setRecurrentes(data.map(mapRecurrenteToCard))
      const atrasadasData = await fetchCuentasAtrasadas()
      setCuentasAtrasadas(atrasadasData)
      bumpTransactions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el abono.')
    }
  }

  const manejarDesmarcarTodo = async (id: number) => {
    const recurrente = recurrentes.find((r) => r.id === id)
    if (!recurrente) return
    if (!window.confirm(`¿Estás seguro de que deseas eliminar todos los abonos de este mes para "${recurrente.nombre}"?`)) {
      return
    }
    setProcesandoId(id)
    setError('')
    try {
      const mesIso = formatIsoDate(fechaRef)
      const actualizado = await desmarcarPagoRecurrente(id, mesIso)
      setRecurrentes((prev) => prev.map((r) => (r.id === id ? mapRecurrenteToCard(actualizado) : r)))
      const atrasadasData = await fetchCuentasAtrasadas()
      setCuentasAtrasadas(atrasadasData)
      bumpTransactions()
    } catch {
      setError('No se pudo limpiar los abonos.')
    } finally {
      setProcesandoId(null)
    }
  }

  const manejarGuardarAbono = async (montoAbono: string) => {
    if (!abonoRecurrente) return
    const id = abonoRecurrente.id
    const mesIso = formatIsoDate(fechaRef)

    setAbonoSaving(true)
    setAbonoError('')
    try {
      const actualizado = await registrarPagoRecurrente(id, montoAbono, mesIso)
      setRecurrentes((prev) => prev.map((r) => (r.id === id ? mapRecurrenteToCard(actualizado) : r)))
      const atrasadasData = await fetchCuentasAtrasadas()
      setCuentasAtrasadas(atrasadasData)
      bumpTransactions()
      setIsAbonoModalOpen(false)
      setAbonoRecurrente(null)
    } catch (err) {
      setAbonoError('No se pudo registrar el abono.')
    } finally {
      setAbonoSaving(false)
    }
  }

  const manejarAlternarActivo = async (id: number, nuevoEstadoActivo: boolean) => {
    if (!nuevoEstadoActivo) {
      if (
        !window.confirm(
          '¿Estás seguro de que deseas desactivar este recurrente? Dejará de figurar como pendiente, pero tus registros de pagos pasados se conservarán.'
        )
      ) {
        return
      }
    }
    setProcesandoId(id)
    setError('')
    try {
      const mesIso = formatIsoDate(fechaRef)
      const actualizado = await updateRecurrente(id, { activo: nuevoEstadoActivo }, mesIso)
      setRecurrentes((prev) =>
        prev.map((r) => (r.id === id ? mapRecurrenteToCard(actualizado) : r))
      )
      if (!nuevoEstadoActivo && !mostrarInactivos) {
        setRecurrentes((prev) => prev.filter((r) => r.id !== id))
      }
      bumpTransactions()
    } catch {
      setError(
        nuevoEstadoActivo
          ? 'No se pudo reactivar el recurrente.'
          : 'No se pudo desactivar el recurrente.'
      )
    } finally {
      setProcesandoId(null)
    }
  }

  const manejarPagarAtrasada = async (item: ApiCuentasAtrasadasItem) => {
    setProcesandoAtrasadaId(item.id)
    setError('')
    try {
      const actualizado = await registrarPagoRecurrente(item.id_recurrente, undefined, item.fecha_pago)
      const mesIso = formatIsoDate(fechaRef)
      if (item.fecha_pago.slice(0, 7) === mesIso.slice(0, 7)) {
        setRecurrentes((prev) =>
          prev.map((r) => (r.id === item.id_recurrente ? mapRecurrenteToCard(actualizado) : r)),
        )
      }
      const atrasadasData = await fetchCuentasAtrasadas()
      setCuentasAtrasadas(atrasadasData)
      bumpTransactions()
    } catch {
      setError('No se pudo registrar el pago atrasado.')
    } finally {
      setProcesandoAtrasadaId(null)
    }
  }

  const manejarGuardar = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !monto || !diaPago || !categoriaId) return

    setSaving(true)
    setModalError('')
    try {
      const payload = {
        nombre: nombre.trim(),
        monto,
        tipo,
        dia_pago: parseInt(diaPago, 10),
        categoria: categoriaId,
        fecha_inicio: fechaInicio ? `${fechaInicio}-01` : null,
        fecha_fin: fechaFin ? `${fechaFin}-01` : null,
        permite_parciales: permiteParciales,
      }

      const mesIso = formatIsoDate(fechaRef)
      if (modalMode === 'edit' && editingId !== null) {
        const actualizado = await updateRecurrente(editingId, payload, mesIso)
        setRecurrentes((prev) =>
          prev.map((r) => (r.id === editingId ? mapRecurrenteToCard(actualizado) : r)),
        )
      } else {
        const creado = await createRecurrente(payload, mesIso)
        setRecurrentes((prev) => [...prev, mapRecurrenteToCard(creado)])
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
            ? 'No se pudo actualizar el recurrente.'
            : 'No se pudo crear el recurrente.'),
      )
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    setSecondaryHeaderAction({
      label: 'Nuevo recurrente',
      onClick: abrirModalCrear,
    })
    return () => setSecondaryHeaderAction(null)
  }, [setSecondaryHeaderAction])

  return (
    <section className="space-y-6 text-slate-800">
      <div className="sticky top-[52px] z-20 -mx-4 -mt-4 bg-slate-100/80 px-4 pb-4 pt-4 backdrop-blur-md dark:bg-slate-950/80 md:top-[40px] md:-mx-8 md:-mt-6 md:px-8">
        <FiltroMesRecurrentes fechaRef={fechaRef} onChangeFecha={setFechaRef} />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {loading && recurrentes.length === 0 ? (
        <p className="text-sm text-slate-500">Cargando recurrentes…</p>
      ) : (
        <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
          <RecurrentesSummaryCard
            totalPendienteGastos={totalPendienteGastos}
            totalPendienteIngresos={totalPendienteIngresos}
          />

          <ResumenCuentasAtrasadas
            deudas={cuentasAtrasadas?.deudas ?? []}
            cobros={cuentasAtrasadas?.cobros ?? []}
            totalPagar={cuentasAtrasadas?.total_pagar ?? 0}
            totalCobrar={cuentasAtrasadas?.total_cobrar ?? 0}
            onPagar={manejarPagarAtrasada}
            procesandoId={procesandoAtrasadaId}
          />

          <div className="flex items-center justify-end pr-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">
                Mostrar recurrentes desactivados
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

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Gastos fijos
              </h2>
              <span className="text-xs text-slate-400">{gastos.length} registrados</span>
            </div>
            {gastos.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                No tienes gastos recurrentes. Ej: Netflix, luz, cuota de préstamo.
              </p>
            ) : (
              <RecurrentesGrid
                recurrentes={gastos}
                onAlternarPago={alternarPago}
                onEditar={abrirModalEditar}
                onAlternarActivo={manejarAlternarActivo}
                onEliminarAbono={manejarEliminarAbono}
                onDesmarcarTodo={manejarDesmarcarTodo}
                procesandoId={procesandoId}
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                Ingresos fijos
              </h2>
              <span className="text-xs text-slate-400">{ingresos.length} registrados</span>
            </div>
            {ingresos.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-emerald-100 bg-white p-6 text-center text-sm text-slate-500">
                No tienes ingresos recurrentes. Ej: sueldo, pensión, alquiler que cobras.
              </p>
            ) : (
              <RecurrentesGrid
                recurrentes={ingresos}
                onAlternarPago={alternarPago}
                onEditar={abrirModalEditar}
                onAlternarActivo={manejarAlternarActivo}
                onEliminarAbono={manejarEliminarAbono}
                onDesmarcarTodo={manejarDesmarcarTodo}
                procesandoId={procesandoId}
              />
            )}
          </div>
        </div>
      )}

      <RecurrenteModal
        open={isModalOpen}
        mode={modalMode}
        tipo={tipo}
        nombre={nombre}
        monto={monto}
        diaPago={diaPago}
        categoriaId={categoriaId}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        categorias={categorias}
        permiteParciales={permiteParciales}
        saving={saving}
        error={modalError}
        onTipoChange={manejarCambioTipo}
        onNombreChange={setNombre}
        onMontoChange={setMonto}
        onDiaPagoChange={setDiaPago}
        onCategoriaIdChange={setCategoriaId}
        onFechaInicioChange={setFechaInicio}
        onFechaFinChange={setFechaFin}
        onPermiteParcialesChange={setPermiteParciales}
        onClose={cerrarModal}
        onSubmit={manejarGuardar}
      />

      <AbonoRecurrenteModal
        open={isAbonoModalOpen}
        recurrente={abonoRecurrente}
        saving={abonoSaving}
        error={abonoError}
        onClose={() => {
          setIsAbonoModalOpen(false)
          setAbonoRecurrente(null)
        }}
        onSubmit={manejarGuardarAbono}
      />
    </section>
  )
}
