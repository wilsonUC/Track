import { AlertCircle, PiggyBank, Zap } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { fetchResumenAhorros } from '../api/ahorros'
import { fetchCategories } from '../api/finanzas'
import {
  asignarAhorroMeta,
  cambiarModoMeta,
  createMeta,
  deleteMeta,
  desasignarAhorroMeta,
  fetchMetas,
  updateMeta,
} from '../api/metas'
import { AsignacionModal } from '../components/metas/AsignacionModal'
import { FiltroMesMetas } from '../components/metas/FiltroMesMetas'
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

type ModoModalState = {
  meta: MetaCardView
  tipo: 'alerta_insuficiente' | 'confirmar_formalizar' | 'confirmar_liberar'
  monto: number
  disponible?: number
}

export function MetasPage() {
  const { transactionsVersion, bumpTransactions, setSecondaryHeaderAction } =
    useOutletContext<OutletContext>()
  const [metas, setMetas] = useState<MetaCardView[]>([])
  const [fechaRef, setFechaRef] = useState<Date>(() => new Date())
  const [mostrarTodas, setMostrarTodas] = useState(false)
  const [libre, setLibre] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [montoObjetivo, setMontoObjetivo] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [categoriaReferenciaId, setCategoriaReferenciaId] = useState<number | ''>('')
  const [esAsignacionLibre, setEsAsignacionLibre] = useState(false)
  const [categoriasGasto, setCategoriasGasto] = useState<Awaited<ReturnType<typeof fetchCategories>>>([])
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const [asignModo, setAsignModo] = useState<AsignacionMode>('asignar')
  const [asignMeta, setAsignMeta] = useState<MetaCardView | null>(null)
  const [asignOpen, setAsignOpen] = useState(false)
  const [asignSaving, setAsignSaving] = useState(false)
  const [asignError, setAsignError] = useState('')

  // Estado para el modal de cambio de modo (alertas y confirmaciones)
  const [modoModal, setModoModal] = useState<ModoModalState | null>(null)
  const [modoModalLoading, setModoModalLoading] = useState(false)

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

  const metasFiltradas = useMemo(() => {
    if (mostrarTodas) return metas

    const refYear = fechaRef.getFullYear()
    const refMonth = fechaRef.getMonth()
    const startOfMonthStr = `${refYear}-${String(refMonth + 1).padStart(2, '0')}-01`
    const lastDay = new Date(refYear, refMonth + 1, 0).getDate()
    const endOfMonthStr = `${refYear}-${String(refMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    return metas.filter((m) => {
      if (m.fechaInicio && m.fechaLimite) {
        return m.fechaInicio <= endOfMonthStr && m.fechaLimite >= startOfMonthStr
      }
      if (m.fechaLimite) {
        return m.fechaLimite >= startOfMonthStr
      }
      if (m.fechaInicio) {
        return m.fechaInicio <= endOfMonthStr
      }
      return true
    })
  }, [metas, mostrarTodas, fechaRef])

  const totalObjetivo = useMemo(
    () => metasFiltradas.reduce((acc, m) => acc + m.objetivo, 0),
    [metasFiltradas],
  )
  const totalAcumulado = useMemo(
    () => metasFiltradas.reduce((acc, m) => acc + m.acumulado, 0),
    [metasFiltradas],
  )
  const porcentajeGlobal =
    totalObjetivo > 0 ? Math.min(100, Math.round((totalAcumulado / totalObjetivo) * 100)) : 0

  const refrescarLibre = () => {
    fetchResumenAhorros()
      .then((r) => setLibre(Number(r.libre)))
      .catch(() => { })
  }

  const resetForm = () => {
    setNombre('')
    setMontoObjetivo('')
    setFechaInicio('')
    setFechaLimite('')
    setCategoriaReferenciaId('')
    setEsAsignacionLibre(false)
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
    setFechaInicio(meta.fechaInicio ?? '')
    setFechaLimite(meta.fechaLimite ?? '')
    setCategoriaReferenciaId(meta.categoriaReferenciaId ?? '')
    setEsAsignacionLibre(meta.esAsignacionLibre)
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

  const manejarCambiarModo = async (meta: MetaCardView) => {
    const nuevoModo = !meta.esAsignacionLibre

    // Caso 1: Pasar de Libre (true) a Ahorro Formal (false)
    if (!nuevoModo && meta.esAsignacionLibre) {
      if (meta.acumulado > 0) {
        try {
          // Intentar sin auto-apartar primero para que backend valide
          const actualizado = await cambiarModoMeta(meta.id, false, false)
          setMetas((prev) => prev.map((m) => (m.id === meta.id ? mapMetaToCard(actualizado) : m)))
          refrescarLibre()
          bumpTransactions()
        } catch (err: unknown) {
          const errObj = err as { data?: { error?: string; monto_a_apartar?: number; requerido?: number; disponible?: number } }
          if (errObj?.data?.error === 'confirmacion_requerida') {
            setModoModal({
              meta,
              tipo: 'confirmar_formalizar',
              monto: errObj.data.monto_a_apartar ?? meta.acumulado,
            })
          } else if (errObj?.data?.error === 'saldo_insuficiente') {
            setModoModal({
              meta,
              tipo: 'alerta_insuficiente',
              monto: errObj.data.requerido ?? meta.acumulado,
              disponible: errObj.data.disponible ?? 0,
            })
          } else {
            alert(err instanceof Error ? err.message : 'No se pudo cambiar el modo.')
          }
        }
      } else {
        // Si no tiene acumulado, cambia directamente
        try {
          const actualizado = await cambiarModoMeta(meta.id, false)
          setMetas((prev) => prev.map((m) => (m.id === meta.id ? mapMetaToCard(actualizado) : m)))
          refrescarLibre()
        } catch (err) {
          alert(err instanceof Error ? err.message : 'No se pudo cambiar el modo.')
        }
      }
    }

    // Caso 2: Pasar de Ahorro Formal (false) a Libre (true)
    else if (nuevoModo && !meta.esAsignacionLibre) {
      if (meta.acumulado > 0) {
        setModoModal({
          meta,
          tipo: 'confirmar_liberar',
          monto: meta.acumulado,
        })
      } else {
        try {
          const actualizado = await cambiarModoMeta(meta.id, true)
          setMetas((prev) => prev.map((m) => (m.id === meta.id ? mapMetaToCard(actualizado) : m)))
          refrescarLibre()
        } catch (err) {
          alert(err instanceof Error ? err.message : 'No se pudo cambiar el modo.')
        }
      }
    }
  }

  const confirmarCambioModoModal = async () => {
    if (!modoModal) return
    setModoModalLoading(true)
    try {
      if (modoModal.tipo === 'confirmar_formalizar') {
        const actualizado = await cambiarModoMeta(modoModal.meta.id, false, true)
        setMetas((prev) => prev.map((m) => (m.id === modoModal.meta.id ? mapMetaToCard(actualizado) : m)))
        refrescarLibre()
        bumpTransactions()
      } else if (modoModal.tipo === 'confirmar_liberar') {
        const actualizado = await cambiarModoMeta(modoModal.meta.id, true)
        setMetas((prev) => prev.map((m) => (m.id === modoModal.meta.id ? mapMetaToCard(actualizado) : m)))
        refrescarLibre()
        bumpTransactions()
      }
      setModoModal(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar modo')
    } finally {
      setModoModalLoading(false)
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
        fecha_inicio: fechaInicio || null,
        fecha_limite: fechaLimite || null,
        categoria_referencia: categoriaReferenciaId || null,
        es_asignacion_libre: esAsignacionLibre,
      }

      if (modalMode === 'edit' && editingId !== null) {
        const metaActual = metas.find((m) => m.id === editingId)
        if (metaActual && metaActual.esAsignacionLibre !== esAsignacionLibre && metaActual.acumulado > 0) {
          // Si cambió el modo durante edición y tiene acumulado, advertir o manejar
          await updateMeta(editingId, payload)
        } else {
          const actualizado = await updateMeta(editingId, payload)
          setMetas((prev) => prev.map((m) => (m.id === editingId ? mapMetaToCard(actualizado) : m)))
        }
      } else {
        const creado = await createMeta(payload)
        setMetas((prev) => [...prev, mapMetaToCard(creado)])
      }

      cerrarModal()
      refrescarLibre()
      bumpTransactions()
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

  const manejarEliminarMeta = async (id: number) => {
    const meta = metas.find((m) => m.id === id)
    if (!meta) return
    const mensaje = meta.esAsignacionLibre
      ? `¿Estás seguro de que deseas eliminar la meta "${meta.nombre}"?`
      : `¿Estás seguro de que deseas eliminar la meta "${meta.nombre}"?\nTodo el ahorro asignado (S/ ${meta.acumulado.toFixed(2)}) se liberará y regresará al Ahorro Libre.`
    if (!window.confirm(mensaje)) {
      return
    }
    try {
      await deleteMeta(id)
      setMetas((prev) => prev.filter((m) => m.id !== id))
      refrescarLibre()
      bumpTransactions()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar la meta.')
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
    <section className="space-y-6 text-slate-800 dark:text-slate-100">
      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Cargando metas…</p>}
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {!loading && !error && (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/40 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-indigo-800 dark:text-indigo-200">
              <PiggyBank className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden />
              <span>
                Tienes <span className="font-bold text-indigo-900 dark:text-indigo-100">{formatSoles(libre)}</span> libres en tu fondo de Ahorros para metas vinculadas.
              </span>
            </div>
            <Link
              to={sectionPaths.ahorros}
              className="shrink-0 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-950/80"
            >
              Ir a Ahorros
            </Link>
          </div>

          <FiltroMesMetas
            fechaRef={fechaRef}
            onChangeFecha={setFechaRef}
            mostrarTodas={mostrarTodas}
            onToggleMostrarTodas={() => setMostrarTodas((v) => !v)}
            totalMetas={metas.length}
            metasVisibles={metasFiltradas.length}
          />

          <MetasSummaryCard
            totalAcumulado={totalAcumulado}
            totalObjetivo={totalObjetivo}
            porcentajeGlobal={porcentajeGlobal}
          />

          {metas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
              Aún no tienes metas. Crea una para empezar a ahorrar hacia un objetivo concreto.
            </p>
          ) : metasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No tienes metas activas o vigentes en el período seleccionado.
              </p>
              <button
                type="button"
                onClick={() => setMostrarTodas(true)}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
              >
                Ver todas las metas
              </button>
            </div>
          ) : (
            <MetasGrid
              metas={metasFiltradas}
              onAsignar={(m) => abrirAsignacion(m, 'asignar')}
              onDesasignar={(m) => abrirAsignacion(m, 'desasignar')}
              onEditar={abrirModalEditar}
              onEliminar={manejarEliminarMeta}
              onCambiarModo={manejarCambiarModo}
            />
          )}
        </>
      )}

      <MetaModal
        open={isModalOpen}
        mode={modalMode}
        nombre={nombre}
        montoObjetivo={montoObjetivo}
        fechaInicio={fechaInicio}
        fechaLimite={fechaLimite}
        categoriaReferenciaId={categoriaReferenciaId}
        categoriasGasto={categoriasGasto}
        esAsignacionLibre={esAsignacionLibre}
        saving={saving}
        error={modalError}
        onNombreChange={setNombre}
        onMontoObjetivoChange={setMontoObjetivo}
        onFechaInicioChange={setFechaInicio}
        onFechaLimiteChange={setFechaLimite}
        onCategoriaReferenciaChange={setCategoriaReferenciaId}
        onEsAsignacionLibreChange={setEsAsignacionLibre}
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

      {/* Modal de Alerta / Confirmación de Cambio de Modo */}
      {modoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {modoModal.tipo === 'alerta_insuficiente' ? (
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                    <AlertCircle className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Saldo disponible insuficiente
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Meta: {modoModal.meta.nombre}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/70 p-3.5 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                  <p>
                    Esta meta tiene <strong>{formatSoles(modoModal.monto)}</strong> acumulados en modo libre, pero solo dispones de <strong>{formatSoles(modoModal.disponible ?? 0)}</strong> en tu balance disponible para respaldarla en Ahorros.
                  </p>
                  <p className="mt-2 text-[11px] text-rose-700 dark:text-rose-400">
                    Para vincularla al fondo de Ahorros, primero reduce el monto acumulado en la meta o incrementa tu saldo disponible.
                  </p>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModoModal(null)}
                    className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            ) : modoModal.tipo === 'confirmar_formalizar' ? (
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <PiggyBank className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      ¿Vincular al Fondo de Ahorros?
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Meta: {modoModal.meta.nombre}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <p>
                    Esta meta tiene <strong>{formatSoles(modoModal.monto)}</strong> acumulados en modo libre.
                  </p>
                  <p className="mt-2">
                    Al vincularla a Ahorros, el sistema apartará automáticamente <strong>{formatSoles(modoModal.monto)}</strong> de tu balance disponible hacia tu fondo de Ahorros para respaldarla.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModoModal(null)}
                    disabled={modoModalLoading}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmarCambioModoModal}
                    disabled={modoModalLoading}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-100 transition-all hover:bg-emerald-700 disabled:opacity-60 dark:shadow-emerald-950/40"
                  >
                    {modoModalLoading ? 'Formalizando…' : 'Sí, formalizar y vincular'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <Zap className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      ¿Cambiar a Asignación Libre?
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Meta: {modoModal.meta.nombre}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <p>
                    Esta meta tiene <strong>{formatSoles(modoModal.monto)}</strong> apartados en Ahorros.
                  </p>
                  <p className="mt-2 text-indigo-700 dark:text-indigo-300">
                    Al pasarla a modo libre, esos <strong>{formatSoles(modoModal.monto)}</strong> se liberarán y volverán a estar disponibles como <strong>Ahorro Libre</strong> en la app, manteniendo el progreso de la meta intacto.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModoModal(null)}
                    disabled={modoModalLoading}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmarCambioModoModal}
                    disabled={modoModalLoading}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-60 dark:shadow-indigo-950/40"
                  >
                    {modoModalLoading ? 'Cambiando…' : 'Sí, cambiar a modo libre'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
