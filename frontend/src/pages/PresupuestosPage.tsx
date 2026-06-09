import React, { useState } from 'react';
import { 
  PieChart, 
  Plus, 
  X, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  ShieldAlert 
} from 'lucide-react';

interface Presupuesto {
  id: number;
  categoria: string;
  limite: number;
  gastado: number;
  color: string;
  barraColor: string;
  icono: any;
}

export function PresupuestosPage() {
 
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([
    {
      id: 1,
      categoria: "TRANSPORTE Y MOVILIDAD",
      limite: 300,
      gastado: 120,
      color: "text-amber-500 bg-amber-50",
      barraColor: "bg-amber-500",
      icono: Sparkles
    },
    {
      id: 2,
      categoria: "EDUCACIÓN Y CURSOS",
      limite: 250,
      gastado: 240,
      color: "text-violet-500 bg-violet-50",
      barraColor: "bg-violet-500",
      icono: BookOpen
    },
    {
      id: 3,
      categoria: "SEGURIDAD Y SALUD",
      limite: 400,
      gastado: 80,
      color: "text-indigo-600 bg-indigo-50",
      barraColor: "bg-indigo-600",
      icono: ShieldAlert
    }
  ]);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoria, setCategoria] = useState('RECREACIÓN');
  const [limite, setLimite] = useState('');

 
  const simularGasto = (id: number) => {
    setPresupuestos(prev => 
      prev.map(p => {
        if (p.id === id) {
          return { ...p, gastado: p.gastado + 30 };
        }
        return p;
      })
    );
  };

 
  const manejarCrearPresupuesto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limite) return;


    let colores = { text: "text-rose-500 bg-rose-50", barra: "bg-rose-500", icono: PieChart };
    if (categoria === "ESTUDIOS") colores = { text: "text-violet-500 bg-violet-50", barra: "bg-violet-500", icono: BookOpen };
    if (categoria === "MOVILIDAD") colores = { text: "text-amber-500 bg-amber-50", barra: "bg-amber-500", icono: Sparkles };

    const nuevoPresupuesto: Presupuesto = {
      id: Date.now(),
      categoria: categoria === 'ESTUDIOS' ? 'EDUCACIÓN Y CURSOS' : categoria === 'MOVILIDAD' ? 'TRANSPORTE Y MOVILIDAD' : 'RECREACIÓN Y OTROS',
      limite: parseFloat(limite),
      gastado: 0, 
      color: colores.text,
      barraColor: colores.barra,
      icono: colores.icono
    };

    setPresupuestos([...presupuestos, nuevoPresupuesto]);
    setLimite('');
    setIsModalOpen(false);
  };

  
  const totalLimite = presupuestos.reduce((acc, p) => acc + p.limite, 0);
  const totalGastado = presupuestos.reduce((acc, p) => acc + p.gastado, 0);
  const porcentajeGlobal = totalLimite > 0 ? Math.round((totalGastado / totalLimite) * 100) : 0;

  return (
    <section className="space-y-6 text-slate-800">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Presupuestos Mensuales</h1>
          <p className="text-sm text-slate-500 mt-1">Controla tus límites de gasto para no salirte del plan.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-5 py-3 rounded-full hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Presupuesto</span>
        </button>
      </div>

      {/* TARJETA DE RESUMEN GLOBAL DE CONSUMO */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Consumido este Mes</span>
          <div className="text-3xl font-black text-slate-900">
            S/ {totalGastado.toFixed(2)} 
            <span className="text-sm font-bold text-slate-400"> / S/ {totalLimite.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Uso del Presupuesto Total</span>
            <span className={`${porcentajeGlobal >= 90 ? 'text-rose-500' : 'text-indigo-600'} font-black`}>
              {porcentajeGlobal}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out rounded-full ${porcentajeGlobal >= 90 ? 'bg-rose-500' : 'bg-indigo-600'}`}
              style={{ width: `${Math.min(porcentajeGlobal, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* GRILLA DE PRESUPUESTOS POR CATEGORÍA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presupuestos.map((p) => {
          const porcentaje = Math.round((p.gastado / p.limite) * 100);
          const excedido = p.gastado > p.limite;
          const alLimite = p.gastado >= p.limite * 0.9 && p.gastado <= p.limite;

          return (
            <div key={p.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col justify-between space-y-5 hover:shadow-md transition-all">
              
              {/* Top de la Tarjeta */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${p.color}`}>
                    <p.icono className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs tracking-wide uppercase">{p.categoria}</h3>
                    <span className="text-[11px] text-slate-400">Límite mensual</span>
                  </div>
                </div>

                {/* Alertas dinámicas */}
                {excedido && (
                  <span className="flex items-center gap-1 bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-1 rounded-md border border-rose-100 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> EXCEDIDO
                  </span>
                )}
                {alLimite && (
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-1 rounded-md border border-amber-100">
                    <AlertTriangle className="w-3 h-3" /> AJUSTADO
                  </span>
                )}
              </div>

              {/* Barra y Números */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-black text-slate-900">
                    S/ {p.gastado}
                    <span className="text-xs font-bold text-slate-400"> / S/ {p.limite}</span>
                  </span>
                  <span className={`text-xs font-black ${excedido ? 'text-rose-500' : alLimite ? 'text-amber-500' : 'text-slate-500'}`}>
                    {porcentaje}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${excedido ? 'bg-rose-500' : alLimite ? 'bg-amber-500' : p.barraColor}`}
                    style={{ width: `${Math.min(porcentaje, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Botón interactivo de prueba */}
              <button 
                onClick={() => simularGasto(p.id)}
                className={`w-full text-xs font-bold py-2.5 rounded-xl transition-all border flex items-center justify-center gap-1 active:scale-95 ${
                  excedido 
                    ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' 
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <span>+ Simular Gasto (S/ 30)</span>
              </button>

            </div>
          );
        })}
      </div>

      {/* MODAL ESTRUCTURAL DE NUEVO PRESUPUESTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Establecer Límite Mensual</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarCrearPresupuesto} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría del Gasto</label>
                <select 
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="MOVILIDAD">Transporte y Movilidad</option>
                  <option value="ESTUDIOS">Educación y Cursos</option>
                  <option value="RECREACION">Recreación y Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Límite Máximo de Dinero (S/)</label>
                <input 
                  type="number" 
                  placeholder="Ej: 200"
                  value={limite}
                  onChange={(e) => setLimite(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
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
                  Asignar Presupuesto
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </section>
  );
}