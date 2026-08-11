import { useState } from 'react'
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
  procesando?: boolean
}

export function RecurrenteCard({
  recurrente,
  onAlternarPago,
  onEditar,
  onAlternarActivo,
  onEliminarAbono,
  onDesmarcarTodo,
  procesando,
}: RecurrenteCardProps) {
  const [mostrarHistorial, setMostrarHistorial] = useState(true)
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
                : estadoPeriodo === 'futuro'
                  ? 'PRÓXIMAMENTE'
                  : 'FINALIZADO'}
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

      <div className="flex items-center justify-between border-y border-slate-50 py-3">
        <div className="space-y-0.5">
          <span className="block text-[11px] font-medium text-slate-400">Monto mensual</span>
          <span
            className={`text-xl font-black ${esIngreso ? 'text-emerald-600' : 'text-slate-900'}`}
          >
            S/ {monto.toFixed(2)}
          </span>
        </div>
        <div className="max-w-[55%] space-y-0.5 text-right">
          <span className="block text-[11px] font-medium text-slate-400">{etiquetaFecha}</span>
          <span className="flex items-center justify-end gap-1 text-sm font-bold text-slate-700">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="text-right leading-tight">{textoDiaPago(diaPago)}</span>
          </span>
        </div>
      </div>

      {activo && (permiteParciales || (abonos && abonos.length > 0)) && (
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-semibold text-slate-500">
                {esIngreso ? 'Cobrado este mes:' : 'Abonado este mes:'}
              </span>
              <span className="font-black text-slate-750">
                S/ {montoPagado.toFixed(2)} / S/ {monto.toFixed(2)} ({Math.min(100, Math.round((montoPagado / monto) * 100))}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  registradoMes ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, Math.round((montoPagado / monto) * 100))}%` }}
              />
            </div>
          </div>

          {abonos && abonos.length > 0 && (
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">
                  Historial de abonos
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrarHistorial(!mostrarHistorial)}
                    className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide cursor-pointer"
                  >
                    {mostrarHistorial ? 'Ocultar' : `Ver (${abonos.length})`}
                  </button>
                  {mostrarHistorial && (
                    <>
                      <span className="text-[9px] text-slate-350 select-none">|</span>
                      <button
                        type="button"
                        onClick={() => onDesmarcarTodo(id)}
                        className="text-[9px] font-bold text-rose-600 hover:text-rose-800 uppercase tracking-wide cursor-pointer"
                        title="Eliminar todos los abonos de este mes"
                      >
                        Limpiar todo
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {mostrarHistorial && (
                <ul className="divide-y divide-slate-100/50 max-h-[110px] overflow-y-auto pr-1">
                  {abonos.map((abono) => (
                    <li key={abono.id} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                      <span className="font-bold text-slate-700">
                        S/ {Number(abono.monto).toFixed(2)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({abono.fecha.slice(8, 10)}/{abono.fecha.slice(5, 7)})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onEliminarAbono(abono.id)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Eliminar abono"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {!activo ? (
          <button
            type="button"
            disabled={procesando}
            onClick={() => onAlternarActivo(id, true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95 disabled:opacity-60"
          >
            <Power className="h-4 w-4 text-emerald-600" aria-hidden />
            <span>{procesando ? 'Procesando…' : 'Reactivar'}</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={procesando || !activoEnMes}
              onClick={() => onAlternarPago(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-60 ${
                !activoEnMes
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
              ) : !activoEnMes ? (
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

            <button
              type="button"
              disabled={procesando}
              onClick={() => onAlternarActivo(id, false)}
              className="flex shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-slate-450 transition-all hover:bg-rose-50 hover:text-rose-650 active:scale-95 disabled:opacity-60"
              aria-label={`Desactivar ${nombre}`}
              title="Desactivar recurrente"
            >
              <Power className="h-3.5 w-3.5" aria-hidden />
            </button>
          </>
        )}
      </div>
    </article>
  )
}
