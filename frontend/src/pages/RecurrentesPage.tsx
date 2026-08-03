import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchCategories } from '../api/finanzas'
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
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  const [fechaRef, setFechaRef] = useState<Date>(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [cuentasAtrasadas, setCuentasAtrasadas] = useState<ApiCuentasAtrasadas | null>(null)
  const [procesandoAtrasadaId, setProcesandoAtrasadaId] = useState<string | null>(null)

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
      fetchRecurrentes(mesIso),
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
  }, [transactionsVersion, fechaRef])

  const gastos = useMemo(() => recurrentes.filter((r) => r.tipo === 'expense'), [recurrentes])
  const ingresos = useMemo(() => recurrentes.filter((r) => r.tipo === 'income'), [recurrentes])

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

    setProcesandoId(id)
    setError('')
    try {
      const mesIso = formatIsoDate(fechaRef)
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
      }

      if (modalMode === 'edit' && editingId !== null) {
        const actualizado = await updateRecurrente(editingId, payload)
        setRecurrentes((prev) =>
          prev.map((r) => (r.id === editingId ? mapRecurrenteToCard(actualizado) : r)),
        )
      } else {
        const creado = await createRecurrente(payload)
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
      <FiltroMesRecurrentes fechaRef={fechaRef} onChangeFecha={setFechaRef} />

      {loading && <p className="text-sm text-slate-500">Cargando recurrentes…</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !error && (
        <>
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
                procesandoId={procesandoId}
              />
            )}
          </div>
        </>
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
        saving={saving}
        error={modalError}
        onTipoChange={manejarCambioTipo}
        onNombreChange={setNombre}
        onMontoChange={setMonto}
        onDiaPagoChange={setDiaPago}
        onCategoriaIdChange={setCategoriaId}
        onFechaInicioChange={setFechaInicio}
        onFechaFinChange={setFechaFin}
        onClose={cerrarModal}
        onSubmit={manejarGuardar}
      />
    </section>
  )
}
