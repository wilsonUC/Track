import React, { useState } from 'react';
import { 
  RefreshCw, 
  Plus, 
  X, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Tv, 
  Zap, 
  CreditCard 
} from 'lucide-react';

interface Recurrente {
  id: number;
  nombre: string;
  monto: number;
  tipo: 'INGRESO' | 'GASTO';
  diaPago: number;
  categoria: string;
  pagadoEsteMes: boolean;
  color: string;
  icono: any;
}

export function RecurrentesPage() {
  // 1. Estado inicial con gastos recurrentes comunes de ejemplo
  const [recurrentes, setRecurrentes] = useState<Recurrente[]>([
    {
      id: 1,
      nombre: "Suscripción de Streaming",
      monto: 34.90,
      tipo: 'GASTO',
      diaPago: 8,
      categoria: "ENTRETENIMIENTO",
      pagadoEsteMes: true,
      color: "text-violet-500 bg-violet-50",
      icono: Tv
    },
    {
      id: 2,
      nombre: "Recibo de Internet y Celular",
      monto: 79.00,
      tipo: 'GASTO',
      diaPago: 15,
      categoria: "SERVICIOS",
      pagadoEsteMes: false,
      color: "text-amber-500 bg-amber-50",
      icono: Zap
    },
    {
      id: 3,
      nombre: "Mantenimiento de Cuenta Premium",
      monto: 15.00,
      tipo: 'GASTO',
      diaPago: 22,
      categoria: "FINANZAS",
      pagadoEsteMes: false,
      color: "text-indigo-600 bg-indigo-50",
      icono: CreditCard
    }
  ]);

  // 2. Estados para el Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [diaPago, setDiaPago] = useState('5');
  const [categoria, setCategoria] = useState('SERVICIOS');

  // 3. Cambiar el estado de pago dinámicamente al hacer clic
  const alternarPago = (id: number) => {
    setRecurrentes(prev => 
      prev.map(r => {
        if (r.id === id) {
          return { ...r, pagadoEsteMes: !r.pagadoEsteMes };
        }
        return r;
      })
    );
  };

  // 4. Manejador para agregar un nuevo registro desde el modal
  const manejarCrearRecurrente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !monto) return;

    let colores = { text: "text-indigo-600 bg-indigo-50", icono: CreditCard };
    if (categoria === "SERVICIOS") colores = { text: "text-amber-500 bg-amber-50", icono: Zap };
    if (categoria === "ENTRETENIMIENTO") colores = { text: "text-violet-500 bg-violet-50", icono: Tv };

    const nuevoRecurrente: Recurrente = {
      id: Date.now(),
      nombre: nombre,
      monto: parseFloat(monto),
      tipo: 'GASTO',
      diaPago: parseInt(diaPago),
      categoria: categoria,
      pagadoEsteMes: false, // Inicia pendiente de pago
      color: colores.text,
      icono: colores.icono
    };

    setRecurrentes([...recurrentes, nuevoRecurrente]);
    setNombre('');
    setMonto('');
    setIsModalOpen(false);
  };

  // Cálculos globales
  const totalPendiente = recurrentes
    .filter(r => !r.pagadoEsteMes && r.tipo === 'GASTO')
    .reduce((acc, r) => acc + r.monto, 0);

  return (
    <section className="space-y-6 text-slate-800">
      
      {/* HEADER DE LA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Transacciones Recurrentes</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona tus pagos fijos y membresías mensuales.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-5 py-3 rounded-full hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Recurrente</span>
        </button>
      </div>

      {/* COMPONENTE DE RESUMEN GLOBAL */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total por Pagar (Pendiente)</span>
          <div className="text-3xl font-black text-rose-500">
            S/ {totalPendiente.toFixed(2)}
          </div>
          <span className="text-xs text-slate-500 block">Suma de las obligaciones no marcadas como pagadas este mes.</span>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin-slow" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Las transacciones recurrentes se reinician automáticamente al inicio de cada mes calendario en tu base de datos.
          </p>
        </div>
      </div>

      {/* GRILLA DE TARJETAS RECURRENTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recurrentes.map((r) => (
          <div key={r.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${r.color}`}>
                  <r.icono className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight">{r.nombre}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{r.categoria}</span>
                </div>
              </div>

              {/* Tag de Estado */}
              {r.pagadoEsteMes ? (
                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-md border border-emerald-100">
                  PAGADO
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-md border border-amber-100 animate-pulse">
                  PENDIENTE
                </span>
              )}
            </div>

            {/* Información de Costo y Vencimiento */}
            <div className="flex items-center justify-between border-t border-b border-slate-50 py-3">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-400 block font-medium">Monto mensual</span>
                <span className="text-xl font-black text-slate-900">S/ {r.monto.toFixed(2)}</span>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[11px] text-slate-400 block font-medium">Vence el día</span>
                <span className="flex items-center justify-end gap-1 text-sm font-bold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {r.diaPago} de cada mes
                </span>
              </div>
            </div>

            {/* Botón de Acción para Alternar Estado */}
            <button 
              onClick={() => r.id && alternarPago(r.id)}
              className={`w-full text-xs font-bold py-2.5 rounded-xl transition-all border flex items-center justify-center gap-1.5 active:scale-95 ${
                r.pagadoEsteMes 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              {r.pagadoEsteMes ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Marcar como Pendiente</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  <span>Marcar como Pagado</span>
                </>
              )}
            </button>

          </div>
        ))}
      </div>

      {/* MODAL ESTRUCTURAL DE NUEVO RECURRENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Añadir Pago Recurrente</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarCrearRecurrente} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Servicio</label>
                <input 
                  type="text" 
                  placeholder="Ej: Recibo de Luz / Spotify"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monto Fijo (S/)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="50.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Día de vencimiento</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31"
                    placeholder="15"
                    value={diaPago}
                    onChange={(e) => setDiaPago(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría</label>
                <select 
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="SERVICIOS">Servicios (Luz, Internet, Agua)</option>
                  <option value="ENTRETENIMIENTO">Entretenimiento (Membresías, Streaming)</option>
                  <option value="FINANZAS">Finanzas / Tarjetas</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                  Registrar Fijo
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </section>
  );
}