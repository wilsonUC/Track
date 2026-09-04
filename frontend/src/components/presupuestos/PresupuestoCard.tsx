import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Clock, Lock, Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { getCategoryDisplay, getCategoryChartColors } from '../../utils/categoryDisplay'
import type { PresupuestoCardView } from './presupuestosTypes'

type PresupuestoCardProps = {
  presupuesto: PresupuestoCardView
  onRegistrarGasto: (id: number) => void
  onEditar: (presupuesto: PresupuestoCardView) => void
  onAlternarActivo?: (id: number, activo: boolean) => void
  onEliminar?: (presupuesto: PresupuestoCardView) => void
  registrando?: boolean
  procesando?: boolean
  esMesActual?: boolean
  esMesPasado?: boolean
  esMesFuturo?: boolean
}

export function PresupuestoCard({
  presupuesto,
  onRegistrarGasto,
  onEditar,
  onAlternarActivo,
  onEliminar,
  registrando,
  procesando,
  esMesActual = true,
  esMesPasado = false,
  esMesFuturo = false,
}: PresupuestoCardProps) {
  const { id, nombre, limite, gastado, montoRapido, porcentaje, estado, iconCategory, consumos, activo } = presupuesto
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
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

  const catInfo = getCategoryDisplay(iconCategory)
  const chartColors = getCategoryChartColors(iconCategory)
  const excedido = estado === 'excedido'
  const alLimite = estado === 'alerta'

  return (
    <article
      className={`flex flex-col justify-between space-y-5 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-slate-900/90 dark:shadow-slate-950/40 ${
        !activo
          ? 'border-slate-200 opacity-60 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40'
          : 'border-slate-100 dark:border-slate-800/80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${catInfo.bg}`}>{catInfo.icon}</div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200">{nombre}</h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-400">Límite mensual</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!activo ? (
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              DESACTIVADO
            </span>
          ) : (
            <>
              {esMesPasado && (
                <span className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                  <Lock className="h-3 w-3" />
                  CERRADO
                </span>
              )}
              {esMesFuturo && (
                <span className="flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Clock className="h-3 w-3" />
                  PRÓXIMO
                </span>
              )}
              {excedido && (
                <span className="flex animate-pulse items-center gap-1 rounded-md border border-rose-100 bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
                  <AlertTriangle className="h-3 w-3" aria-hidden />
                  EXCEDIDO
                </span>
              )}
              {alLimite && (
                <span className="flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" aria-hidden />
                  AJUSTADO
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">
            S/ {gastado.toFixed(2)}
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400"> / S/ {limite.toFixed(2)}</span>
          </span>
          <span
            className={`text-xs font-black ${
              excedido ? 'text-rose-500' : alLimite ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {porcentaje}%
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              excedido ? 'bg-rose-500' : alLimite ? 'bg-amber-500' : chartColors.colorBg
            }`}
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          />
        </div>
      </div>

      {/* Historial de consumos (Solo lectura) */}
      {consumos && consumos.length > 0 && (
        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 dark:border-slate-800">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Historial de consumos
            </span>
            <button
              type="button"
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className="cursor-pointer text-[9px] font-bold uppercase tracking-wide text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {mostrarHistorial ? 'Ocultar' : `Ver (${consumos.length})`}
            </button>
          </div>

          {mostrarHistorial && (
            <ul className="max-h-[120px] divide-y divide-slate-100/60 overflow-y-auto pr-1 dark:divide-slate-800/60">
              {consumos.map((consumo) => (
                <li key={consumo.id} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    S/ {Number(consumo.monto).toFixed(2)}
                  </span>
                  <span className="font-medium text-slate-400 dark:text-slate-400 text-[11px]">
                    {consumo.fecha.slice(8, 10)}/{consumo.fecha.slice(5, 7)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2">
        {!activo ? (
          <>
            <button
              type="button"
              onClick={() => onEditar(presupuesto)}
              className="flex shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-indigo-950/50"
              aria-label={`Editar presupuesto ${nombre}`}
              title="Editar presupuesto"
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
                title="Opciones de presupuesto"
              >
                <Power className="h-3.5 w-3.5" aria-hidden />
              </button>

              {menuEstadoAbierto && (
                <div className="absolute bottom-full right-0 mb-2 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-lg backdrop-blur-sm z-30 dark:border-slate-800 dark:bg-slate-900">
                  {onAlternarActivo && (
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
                  )}
                  {onEliminar && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuEstadoAbierto(false)
                        onEliminar(presupuesto)
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors border-t border-slate-50 dark:border-slate-800/60 mt-0.5 pt-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Eliminar presupuesto</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {esMesActual ? (
              <button
                type="button"
                disabled={registrando || procesando}
                onClick={() => onRegistrarGasto(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-60 ${
                  excedido
                    ? 'border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400'
                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-indigo-950/50'
                }`}
              >
                <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{registrando ? 'Registrando…' : `Registrar gasto (S/ ${montoRapido})`}</span>
              </button>
            ) : (
              <div
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50/70 py-2.5 text-xs font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400 select-none cursor-not-allowed"
                title={esMesPasado ? 'Período cerrado (solo lectura)' : 'Próximo período (no iniciado)'}
              >
                <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                <span>{esMesPasado ? 'Mes cerrado' : 'Próximo mes'}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => onEditar(presupuesto)}
              className={`flex shrink-0 items-center justify-center rounded-xl border px-3 py-2.5 transition-all active:scale-95 ${
                excedido
                  ? 'border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400'
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-indigo-950/50'
              }`}
              aria-label={`Editar presupuesto ${nombre}`}
              title="Editar presupuesto"
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
                title="Opciones de presupuesto"
              >
                <Power className="h-3.5 w-3.5" aria-hidden />
              </button>

              {menuEstadoAbierto && (
                <div className="absolute bottom-full right-0 mb-2 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-lg backdrop-blur-sm z-30 dark:border-slate-800 dark:bg-slate-900">
                  {onAlternarActivo && (
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
                  )}
                  {onEliminar && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuEstadoAbierto(false)
                        onEliminar(presupuesto)
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
