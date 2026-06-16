import { AlertCircle, AlertTriangle, Calendar, CheckCircle2, Pencil } from 'lucide-react'
import { getCategoryDisplay } from '../../utils/categoryDisplay'
import { textoDiaPago } from '../../utils/recurrentesDisplay'
import type { RecurrenteCardView } from './recurrentesTypes'

type RecurrenteCardProps = {
  recurrente: RecurrenteCardView
  onAlternarPago: (id: number) => void
  onEditar: (recurrente: RecurrenteCardView) => void
  procesando?: boolean
}

export function RecurrenteCard({
  recurrente,
  onAlternarPago,
  onEditar,
  procesando,
}: RecurrenteCardProps) {
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
  } = recurrente
  const esIngreso = tipo === 'income'
  const catInfo = getCategoryDisplay(categoriaNombre)
  const etiquetaFecha = esIngreso ? 'Se cobra el día' : 'Vence el día'

  return (
    <article
      className={`flex flex-col justify-between space-y-4 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
        esIngreso ? 'border-emerald-100' : 'border-slate-100'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`shrink-0 rounded-xl p-2.5 ${catInfo.bg}`}>{catInfo.icon}</div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-tight text-slate-800">{nombre}</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {categoriaNombre}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {registradoMes ? (
            <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">
              {esIngreso ? 'COBRADO' : 'PAGADO'}
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

      <div className="flex gap-2">
        <button
          type="button"
          disabled={procesando}
          onClick={() => onAlternarPago(id)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-60 ${
            registradoMes
              ? 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : esIngreso
                ? 'border-emerald-100 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50'
                : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          {procesando ? (
            <span>Procesando…</span>
          ) : registradoMes ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              <span>Marcar como pendiente</span>
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
      </div>
    </article>
  )
}
