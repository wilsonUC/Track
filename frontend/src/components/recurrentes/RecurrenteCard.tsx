import { useEffect, useRef, useState } from 'react'
import { AlertCircle, AlertTriangle, Calendar, CheckCircle2, Pencil, Power, Trash2 } from 'lucide-react'
import { getCategoryDisplay } from '../../utils/categoryDisplay'
import { textoDiaPago } from '../../utils/recurrentesDisplay'
import type { RecurrenteCardView } from './recurrentesTypes'

type RecurrenteCardProps = {
  recurrente: RecurrenteCardView
  onAlternarPago: (id: number) => void
  onEditar: (recurrente: RecurrenteCardView) => void
  onAlternarActivo: (id: number, activo: boolean) => void
  onEliminarAbono: (transactionId: number) => void
  onDesmarcarTodo: (id: number) => void
  onEliminar?: (recurrente: RecurrenteCardView) => void
  procesando?: boolean
}

export function RecurrenteCard({
  recurrente,
  onAlternarPago,
  onEditar,
  onAlternarActivo,
  onEliminarAbono,
  onDesmarcarTodo,
  onEliminar,
  procesando,
}: RecurrenteCardProps) {
  const [mostrarHistorial, setMostrarHistorial] = useState(true)
  const [menuEstadoAbierto, setMenuEstadoAbierto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuEstadoAbierto) return

    const handleClickFuera = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuEstadoAbierto(false)
      }
    }

    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [menuEstadoAbierto])

  const {
    id,
    nombre,
    monto,
    diaPago,
    categoriaNombre,
    registradoMes,
    vencido,
    mesAnteriorSinRegistrar,
    tipo,
    fechaInicio,
    fechaFin,
    activoEnMes,
    estadoPeriodo,
    activo,
    permiteParciales,
    montoPagado,
    abonos,
  } = recurrente
  const esIngreso = tipo === 'income'
  const catInfo = getCategoryDisplay(categoriaNombre)
  const etiquetaFecha = esIngreso ? 'Se cobra el día' : 'Vence el día'

  const formatPeriodoText = () => {
    const shorten = (d: string) => d.replace(/^(\d{4})/, (m) => m.slice(2))
    const fIni = fechaInicio ? shorten(fechaInicio) : ''
    const fFin = fechaFin ? shorten(fechaFin) : ''
    if (fIni && fFin) return `${fIni} a ${fFin}`
    if (fIni) return `Desde ${fIni}`
    if (fFin) return `Hasta ${fFin}`
    return null
  }
  const periodoText = formatPeriodoText()

  return (
    <article
      className={`flex flex-col justify-between space-y-4 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
        !activo
          ? 'border-slate-200 opacity-60 bg-slate-50/50'
          : esIngreso
            ? 'border-emerald-100'
            : 'border-slate-100'
      } ${activo && !activoEnMes ? 'opacity-80' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`shrink-0 rounded-xl p-2.5 ${catInfo.bg}`}>{catInfo.icon}</div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-tight text-slate-800">{nombre}</h3>
            <div className="flex items-center gap-x-1 text-[9.5px] whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="font-bold uppercase tracking-wider text-slate-400">
                {categoriaNombre}
              </span>
              {periodoText && (
                <>
                  <span className="text-slate-300 select-none">·</span>
                  <span className="text-slate-500 truncate">
                    {periodoText}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {registradoMes ? (
            <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">
              {esIngreso ? 'COBRADO' : 'PAGADO'}
            </span>
          ) : !activo ? (
            <span className="rounded-md border border-slate-250 bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
              DESACTIVADO
            </span>
          ) : !activoEnMes ? (
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
              {estadoPeriodo === 'no_iniciado'
                ? 'NO INICIADO'
                : 'FINALIZADO'}
            </span>
          ) : estadoPeriodo === 'futuro' ? (
            <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400">
              PRÓXIMAMENTE
            </span>
          ) : (
            <span
              className={`flex animate-pulse items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-black ${
                esIngreso
                  ? 'border-cyan-100 bg-cyan-50 text-cyan-700'
                  : 'border-amber-100 bg-amber-50 text-amber-600'
              }`}
            >
              PENDIENTE
            </span>
          )}
          {!registradoMes && vencido && (
            <span className="flex items-center gap-1 rounded-md border border-rose-100 bg-rose-50 px-2 py-0.5 text-[9px] font-black text-rose-600">
              <AlertTriangle className="h-3 w-3" aria-hidden />
              VENCIDO
            </span>
          )}
          {!registradoMes && mesAnteriorSinRegistrar && (
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
              Sin registrar en {mesAnteriorSinRegistrar}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-y border-slate-50 py-3 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="block text-[11px] font-medium text-slate-400">Monto mensual</span>
            {recurrente.tieneAjusteMes && (
              <span
                className="rounded-md border border-amber-200/60 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300"
                title={`Ajuste puntual para este mes. Monto base: S/ ${recurrente.montoBase.toFixed(2)}`}
              >
                Ajuste mes
              </span>
            )}
          </div>
          <span
            className={`text-xl font-black ${esIngreso ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}
          >
            S/ {monto.toFixed(2)}
          </span>
        </div>
        <div className="max-w-[55%] space-y-0.5 text-right">
          <span className="block text-[11px] font-medium text-slate-400">{etiquetaFecha}</span>
          <span className="flex items-center justify-end gap-1 text-sm font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="text-right leading-tight">{textoDiaPago(diaPago)}</span>
          </span>
        </div>
      </div>

      {/* Progreso de pagos si permite abonos o si ya tiene abonos */}
      {(permiteParciales || (abonos && abonos.length > 0)) && (
        <div className="space-y-2 rounded-xl bg-slate-50/70 p-3 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="text-slate-400 dark:text-slate-400 text-[11px]">Abonado este mes:</span>
            <span className="text-slate-800 dark:text-slate-200">
              S/ {montoPagado.toFixed(2)} / S/ {monto.toFixed(2)} ({Math.min(100, Math.round((montoPagado / monto) * 100))}%)
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                registradoMes
                  ? 'bg-emerald-500'
                  : esIngreso
                    ? 'bg-cyan-500'
                    : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, (montoPagado / monto) * 100)}%` }}
            />
          </div>

          {/* Historial de abonos con scroll */}
          {abonos && abonos.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                <span className="uppercase tracking-wider">Historial de abonos</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrarHistorial(!mostrarHistorial)}
                    className="hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {mostrarHistorial ? 'Ocultar' : 'Ver'}
                  </button>
                  {registradoMes && (
                    <>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => onDesmarcarTodo(id)}
                        className="text-rose-500 hover:text-rose-600 font-bold"
                      >
                        Limpiar todo
                      </button>
                    </>
                  )}
                </div>
              </div>

              {mostrarHistorial && (
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {abonos.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          S/ {Number(a.monto).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({a.fecha.slice(8, 10)}/{a.fecha.slice(5, 7)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onEliminarAbono(a.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                        title="Eliminar abono"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {!activo ? (
          <>
            <button
              type="button"
              onClick={() => onEditar(recurrente)}
              className="flex shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
              aria-label={`Editar ${nombre}`}
              title="Editar recurrente"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
            </button>

            {/* Power / Opciones Dropdown */}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                disabled={procesando}
                onClick={() => setMenuEstadoAbierto(!menuEstadoAbierto)}
                className={`flex shrink-0 items-center justify-center rounded-xl border px-3 py-2.5 transition-all active:scale-95 disabled:opacity-60 ${
                  menuEstadoAbierto
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400'
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
                }`}
                aria-label={`Opciones de ${nombre}`}
                title="Opciones de recurrente"
              >
                <Power className="h-3.5 w-3.5" aria-hidden />
              </button>

              {menuEstadoAbierto && (
                <div className="absolute bottom-full right-0 mb-2 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-lg backdrop-blur-sm z-30 dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuEstadoAbierto(false)
                      onAlternarActivo(id, true)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 transition-colors"
                  >
                    <Power className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Reactivar</span>
                  </button>
                  {onEliminar && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuEstadoAbierto(false)
                        onEliminar(recurrente)
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors border-t border-slate-50 dark:border-slate-800/60 mt-0.5 pt-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Eliminar recurrente</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={procesando || !activoEnMes || estadoPeriodo === 'futuro'}
              onClick={() => onAlternarPago(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-60 ${
                !activoEnMes || estadoPeriodo === 'futuro'
                  ? 'border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed'
                  : registradoMes
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : esIngreso
                      ? 'border-emerald-100 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50'
                      : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              {procesando ? (
                <span>Procesando…</span>
              ) : !activoEnMes || estadoPeriodo === 'futuro' ? (
                <span>{estadoPeriodo === 'futuro' ? 'Aún no disponible' : 'Fuera de período'}</span>
              ) : registradoMes ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                  <span>Marcar como pendiente</span>
                </>
              ) : permiteParciales ? (
                <>
                  <AlertCircle
                    className={`h-4 w-4 ${esIngreso ? 'text-emerald-500' : 'text-slate-400'}`}
                    aria-hidden
                  />
                  <span>{esIngreso ? 'Registrar cobro' : 'Registrar abono'}</span>
                </>
              ) : (
                <>
                  <AlertCircle
                    className={`h-4 w-4 ${esIngreso ? 'text-emerald-500' : 'text-slate-400'}`}
                    aria-hidden
                  />
                  <span>{esIngreso ? 'Marcar como cobrado' : 'Marcar como pagado'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onEditar(recurrente)}
              className="flex shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
              aria-label={`Editar ${nombre}`}
              title="Editar recurrente"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
            </button>

            {/* Power / Opciones Dropdown */}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                disabled={procesando}
                onClick={() => setMenuEstadoAbierto(!menuEstadoAbierto)}
                className={`flex shrink-0 items-center justify-center rounded-xl border px-3 py-2.5 transition-all active:scale-95 disabled:opacity-60 ${
                  menuEstadoAbierto
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400'
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
                }`}
                aria-label={`Opciones de ${nombre}`}
                title="Opciones de recurrente"
              >
                <Power className="h-3.5 w-3.5" aria-hidden />
              </button>

              {menuEstadoAbierto && (
                <div className="absolute bottom-full right-0 mb-2 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-lg backdrop-blur-sm z-30 dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuEstadoAbierto(false)
                      onAlternarActivo(id, false)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 transition-colors"
                  >
                    <Power className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Desactivar</span>
                  </button>
                  {onEliminar && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuEstadoAbierto(false)
                        onEliminar(recurrente)
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors border-t border-slate-50 dark:border-slate-800/60 mt-0.5 pt-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  )
}
