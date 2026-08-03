import { useState } from 'react'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Calendar, ChevronDown, CheckCircle2 } from 'lucide-react'
import type { ApiCuentasAtrasadasItem } from '../../api/recurrentes'

type ResumenCuentasAtrasadasProps = {
  deudas: ApiCuentasAtrasadasItem[]
  cobros: ApiCuentasAtrasadasItem[]
  totalPagar: number
  totalCobrar: number
  onPagar: (item: ApiCuentasAtrasadasItem) => void
  procesandoId: string | null
}

export function ResumenCuentasAtrasadas({
  deudas,
  cobros,
  totalPagar,
  totalCobrar,
  onPagar,
  procesandoId,
}: ResumenCuentasAtrasadasProps) {
  const [pagarExpanded, setPagarExpanded] = useState(false)
  const [cobrarExpanded, setCobrarExpanded] = useState(false)

  return (
    <div className="space-y-6">
      {/* Cabecera Informativa */}
      {(deudas.length > 0 || cobros.length > 0) && (
        <div className="rounded-2xl bg-indigo-950 p-5 text-white shadow-lg border border-indigo-900/50">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-indigo-400" />
                Cuentas Atrasadas de Meses Anteriores
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                Tienes saldos acumulados de periodos anteriores pendientes de registrar. Puedes liquidarlos aquí.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Tablas */}
      {(deudas.length > 0 || cobros.length > 0) && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
          {/* CUENTAS POR PAGAR (DEUDAS) */}
          {deudas.length > 0 && (
            <section className="flex flex-col rounded-2xl border border-rose-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div
                onClick={() => setPagarExpanded(!pagarExpanded)}
                className={`flex items-center justify-between cursor-pointer select-none group hover:opacity-80 transition-all ${
                  pagarExpanded ? 'pb-4 border-b border-rose-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`h-5 w-5 text-rose-400 transition-transform duration-300 group-hover:text-rose-600 ${
                      pagarExpanded ? 'rotate-180' : ''
                    }`}
                  />
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-rose-500">
                      <ArrowDownRight className="h-4 w-4" />
                      Cuentas por pagar
                    </span>
                    <h3 className="text-lg font-black text-slate-800">Deudas acumuladas</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-medium text-slate-400 uppercase">Total adeudado</span>
                  <span className="text-2xl font-black text-rose-600">S/ {totalPagar.toFixed(2)}</span>
                </div>
              </div>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  pagarExpanded ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-3">
                  {deudas.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-sm font-bold text-slate-700 truncate">{item.nombre}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-semibold">{item.categoria}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-slate-500">
                            <Calendar className="h-3 w-3 shrink-0" />
                            {item.mes_atraso}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-800">
                            S/ {item.acumulado.toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={procesandoId === item.id}
                          onClick={() => onPagar(item)}
                          className="flex h-8 items-center gap-1 rounded-lg border border-rose-100 bg-rose-50/50 px-2.5 text-[10px] font-bold text-rose-700 transition-all hover:bg-rose-50 active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{procesandoId === item.id ? 'Pagando…' : 'Pagar'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-rose-50 pt-4 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Conceptos con mora</span>
                <span className="font-bold text-rose-600">{deudas.length} facturas pendientes</span>
              </div>
            </section>
          )}

          {/* CUENTAS POR COBRAR (INGRESOS ATRASADOS) */}
          {cobros.length > 0 && (
            <section className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div
                onClick={() => setCobrarExpanded(!cobrarExpanded)}
                className={`flex items-center justify-between cursor-pointer select-none group hover:opacity-80 transition-all ${
                  cobrarExpanded ? 'pb-4 border-b border-emerald-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`h-5 w-5 text-emerald-400 transition-transform duration-300 group-hover:text-emerald-600 ${
                      cobrarExpanded ? 'rotate-180' : ''
                    }`}
                  />
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-emerald-500">
                      <ArrowUpRight className="h-4 w-4" />
                      Cuentas por cobrar
                    </span>
                    <h3 className="text-lg font-black text-slate-800">Cobros pendientes</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-medium text-slate-400 uppercase">Total a recibir</span>
                  <span className="text-2xl font-black text-emerald-600">S/ {totalCobrar.toFixed(2)}</span>
                </div>
              </div>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  cobrarExpanded ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-3">
                  {cobros.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-sm font-bold text-slate-700 truncate">{item.nombre}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-semibold">{item.categoria}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-slate-500">
                            <Calendar className="h-3 w-3 shrink-0" />
                            {item.mes_atraso}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600">
                            S/ {item.acumulado.toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={procesandoId === item.id}
                          onClick={() => onPagar(item)}
                          className="flex h-8 items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50/50 px-2.5 text-[10px] font-bold text-emerald-700 transition-all hover:bg-emerald-50 active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{procesandoId === item.id ? 'Cobrando…' : 'Cobrar'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-emerald-50 pt-4 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Ingresos retrasados</span>
                <span className="font-bold text-emerald-600">{cobros.length} cobros pendientes</span>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
