import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Sparkles, 
  Layers,
  CheckCircle2,
  X,
} from 'lucide-react';

interface Meta {
  id: number;
  nombre: string;
  objetivo: number;
  actual: number;
  fechaLimite: string;
  categoria: string;
  color: string;
  icono: any;
}

export function MetasPage() {
  // 1. Lista de metas iniciales
  const [metas, setMetas] = useState<Meta[]>([
    {
      id: 1,
      nombre: "Fondo de Emergencia Estudiantil",
      objetivo: 2000,
      actual: 1500,
      fechaLimite: "Diciembre 2026",
      categoria: "SEGURIDAD",
      color: "bg-indigo-600",
      icono: Target
    },
    {
      id: 2,
      nombre: "Mantenimiento y Mejoras del Scooter",
      objetivo: 800,
      actual: 640,
      fechaLimite: "Agosto 2026",
      categoria: "TRANSPORTE",
      color: "bg-amber-500",
      icono: Sparkles
    },
    {
      id: 3,
      nombre: "Curso de Especialización de Desarrollo",
      objetivo: 1200,
      actual: 300,
      fechaLimite: "Octubre 2026",
      categoria: "EDUCACIÓN",
      color: "bg-violet-500",
      icono: Layers
    }
  ]);

  // 2. Estados para controlar el Modal y el Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [categoria, setCategoria] = useState('SEGURIDAD');
  const [fechaLimite, setFechaLimite] = useState('Diciembre 2026');

  // Función para simular depósitos de S/ 100
  const ahorrarMeta = (id: number) => {
    setMetas(prevMetas => 
      prevMetas.map(meta => {
        if (meta.id === id) {
          return { ...meta, actual: Math.min(meta.actual + 100, meta.objetivo) };
        }
        return meta;
      })
    );
  };

  // 3. Manejador para crear la nueva meta dinámicamente
  const manejarCrearMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !objetivo) return;

    // Asignamos colores e iconos automáticos según la categoría elegida
    let colorAsignado = "bg-indigo-600";
    let iconoAsignado = Target;
    if (categoria === "TRANSPORTE") { colorAsignado = "bg-amber-500"; iconoAsignado = Sparkles; }
    if (categoria === "EDUCACIÓN") { colorAsignado = "bg-violet-500"; iconoAsignado = Layers; }

    const nuevaMeta: Meta = {
      id: Date.now(), // ID temporal único
      nombre: nombre,
      objetivo: parseFloat(objetivo),
      actual: 0, // Inicia en 0 para que veas el progreso desde el principio
      fechaLimite: fechaLimite,
      categoria: categoria,
      color: colorAsignado,
      icono: iconoAsignado
    };

    setMetas([...metas, nuevaMeta]);
    
    setNombre('');
    setObjetivo('');
    setIsModalOpen(false);
  };

  // Cálculos globales automáticos
  const totalObjetivo = metas.reduce((acc, m) => acc + m.objetivo, 0);
  const totalActual = metas.reduce((acc, m) => acc + m.actual, 0);
  const progresoGlobal = totalObjetivo > 0 ? Math.round((totalActual / totalObjetivo) * 100) : 0;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-slate-800 relative">
      
      {/* HEADER CON ACCIÓN PARA ABRIR EL MODAL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Metas de Ahorro</h1>
          <p className="text-sm text-slate-500 mt-1">Prueba interactiva del sistema de objetivos financieros.</p>
        </div>
        
        {/* Cambiamos el alert anterior para que ahora abra el modal real */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-5 py-3 rounded-full hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Meta</span>
        </button>
      </div>

      {/* COMPONENTE DE CONTROL GLOBAL */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ahorro Total Acumulado</span>
          <div className="text-3xl font-black text-indigo-600">S/ {totalActual.toFixed(2)}</div>
          <span className="text-xs text-slate-500 block">De una meta global de S/ {totalObjetivo.toFixed(2)}</span>
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Progreso General de tu Cuenta</span>
            <span className="text-indigo-600 font-black">{progresoGlobal}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progresoGlobal}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* GRILLA DE METAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metas.map((meta) => {
          const porcentaje = Math.round((meta.actual / meta.objetivo) * 100);
          const completada = meta.actual === meta.objetivo;

          return (
            <div key={meta.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-wider bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">
                    {meta.categoria}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Meta: {meta.fechaLimite}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl text-white ${meta.color} shadow-sm`}>
                    <meta.icono className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{meta.nombre}</h3>
                    <span className="text-[11px] text-slate-400">Progreso actual</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-black text-slate-900">
                    S/ {meta.actual} 
                    <span className="text-xs font-bold text-slate-400 font-sans"> / S/ {meta.objetivo}</span>
                  </span>
                  <span className={`text-xs font-bold ${completada ? 'text-emerald-500' : 'text-slate-600'}`}>
                    {porcentaje}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`${meta.color} h-full transition-all duration-300 rounded-full`}
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-1">
                {completada ? (
                  <div className="w-full bg-emerald-50 text-emerald-600 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Meta Lograda con Éxito!</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => ahorrarMeta(meta.id)}
                    className="w-full bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs font-bold py-2.5 rounded-xl transition-all border border-slate-100 flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Simular Depósito (S/ 100)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL ESTRUCTURAL DE PRUEBA (Fondo oscuro + Formulario) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header del modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Crear Nueva Meta</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={manejarCrearMeta} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Objetivo</label>
                <input 
                  type="text" 
                  placeholder="Ej: Repuestos del Segway G3"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monto Objetivo (S/)</label>
                  <input 
                    type="number" 
                    placeholder="500"
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plazo estimado</label>
                  <input 
                    type="text" 
                    placeholder="Agosto 2026"
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría del Ahorro</label>
                <select 
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="SEGURIDAD">Seguridad (Fondo Fijo)</option>
                  <option value="TRANSPORTE">Transporte / Vehículo</option>
                  <option value="EDUCACIÓN">Educación / Libros</option>
                </select>
              </div>

              {/* Botones de acción inferiores */}
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
                  Guardar Meta
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}