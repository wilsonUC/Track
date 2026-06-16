import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import { fetchCategories } from '../api/finanzas'
import {
  createRecurrente,
  desmarcarPagoRecurrente,
  fetchRecurrentes,
  registrarPagoRecurrente,
  updateRecurrente,
} from '../api/recurrentes'
import { RecurrenteModal } from '../components/recurrentes/RecurrenteModal'
import { RecurrentesGrid } from '../components/recurrentes/RecurrentesGrid'
import { RecurrentesSummaryCard } from '../components/recurrentes/RecurrentesSummaryCard'
import { RecurrentesToolbar } from '../components/recurrentes/RecurrentesToolbar'
import type { RecurrenteCardView } from '../components/recurrentes/recurrentesTypes'
import { mapRecurrenteToCard } from '../utils/recurrentesDisplay'

type OutletContext = {
  transactionsVersion: number
  bumpTransactions: () => void
}

type ModalMode = 'create' | 'edit'

export function RecurrentesPage() {
  const { transactionsVersion, bumpTransactions } = useOutletContext<OutletContext>()
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
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchRecurrentes(), fetchCategories()])
      .then(([data, cats]) => {
        if (cancelled) return
        setRecurrentes(data.map(mapRecurrenteToCard))
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
  }, [transactionsVersion])

  const gastos = useMemo(() => recurrentes.filter((r) => r.tipo === 'expense'), [recurrentes])
  const ingresos = useMemo(() => recurrentes.filter((r) => r.tipo === 'income'), [recurrentes])

  const totalPendienteGastos = useMemo(
    () => gastos.filter((r) => !r.registradoMes).reduce((acc, r) => acc + r.monto, 0),
    [gastos],
  )

  const totalPendienteIngresos = useMemo(
    () => ingresos.filter((r) => !r.registradoMes).reduce((acc, r) => acc + r.monto, 0),
    [ingresos],
  )

  const resetForm = () => {
    setNombre('')
    setMonto('')
    setDiaPago('5')
    setCategoriaId('')
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
      const actualizado = recurrente.registradoMes
        ? await desmarcarPagoRecurrente(id)
        : await registrarPagoRecurrente(id)
      setRecurrentes((prev) => prev.map((r) => (r.id === id ? mapRecurrenteToCard(actualizado) : r)))
      bumpTransactions()
    } catch {
      setError('No se pudo actualizar el estado del recurrente.')
    } finally {
      setProcesandoId(null)
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
    } catch {
      setModalError(
        modalMode === 'edit'
          ? 'No se pudo actualizar el recurrente.'
          : 'No se pudo crear el recurrente.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6 text-slate-800">
      <RecurrentesToolbar onNuevoRecurrente={abrirModalCrear} />

      {loading && <p className="text-sm text-slate-500">Cargando recurrentes…</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !error && (
        <>
          <RecurrentesSummaryCard
            totalPendienteGastos={totalPendienteGastos}
            totalPendienteIngresos={totalPendienteIngresos}
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
        categorias={categorias}
        saving={saving}
        error={modalError}
        onTipoChange={manejarCambioTipo}
        onNombreChange={setNombre}
        onMontoChange={setMonto}
        onDiaPagoChange={setDiaPago}
        onCategoriaIdChange={setCategoriaId}
        onClose={cerrarModal}
        onSubmit={manejarGuardar}
      />
    </section>
  )
}
