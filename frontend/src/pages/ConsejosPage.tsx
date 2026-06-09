import { useState } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  ShieldAlert, 
  PiggyBank, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  CheckCircle
} from 'lucide-react';

interface Consejo {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: 'AHORRO' | 'ALERTA' | 'INVERSIÓN' | 'GENERAL';
  impacto: 'ALTO' | 'MEDIO' | 'OPTIMISTA';
  colorIcono: string;
  bgIcono: string;
  icono: any;
}

export function ConsejosPage() {
  // 1. Estado para filtrar por categorías
  const [categoriaActiva, setCategoriaActiva] = useState<string>('TODOS');

  // 2. Base de datos simulada con consejos personalizados para el usuario
  const [consejos] = useState<Consejo[]>([
    {
      id: 1,
      titulo: "¡Cuidado con el presupuesto de Transporte!",
      descripcion: "Has superado el límite mensual establecido para Movilidad. Te recomendamos reducir los viajes en taxi esta semana y priorizar opciones más económicas para equilibrar tu saldo.",
      categoria: 'ALERTA',
      impacto: 'ALTO',
      colorIcono: "text-rose-500",
      bgIcono: "bg-rose-50 border-rose-100",
      icono: ShieldAlert
    },
    {
      id: 2,
      titulo: "Optimiza tus suscripciones activas",
      descripcion: "Tienes 3 servicios recurrentes activos este mes. Revisa si realmente utilizas todos constantemente; cancelar solo uno de S/ 15 o S/ 30 podría darte un respiro extra al año.",
      categoria: 'AHORRO',
      impacto: 'MEDIO',
      colorIcono: "text-amber-500",
      bgIcono: "bg-amber-50 border-amber-100",
      icono: Lightbulb
    },
    {
      id: 3,
      titulo: "Meta 'Fondo de Emergencia' lograda",
      descripcion: "¡Espectacular! Has completado el 100% de tu fondo de seguridad estudiantil. Tu colchón financiero está listo; ahora puedes enfocar ese flujo de dinero en tus otras metas activas.",
      categoria: 'AHORRO',
      impacto: 'OPTIMISTA',
      colorIcono: "text-emerald-500",
      bgIcono: "bg-emerald-50 border-emerald-100",
      icono: CheckCircle
    },
    {
      id: 4,
      titulo: "La regla del 50/30/20 para principiantes",
      descripcion: "Prueba dividir tus ingresos netos de esta manera: 50% para tus necesidades básicas y recibos, 30% para tus gustos o entretenimiento, y un 20% destinado directamente al ahorro o inversión.",
      categoria: 'GENERAL',
      impacto: 'MEDIO',
      colorIcono: "text-indigo-600",
      bgIcono: "bg-indigo-50 border-indigo-100",
      icono: BookOpen
    },
    {
      id: 5,
      titulo: "Interés Compuesto: Haz crecer tu dinero",
      descripcion: "Ahorrar es genial, pero invertir a largo plazo en opciones seguras (como depósitos a plazo fijo regulados) hace que tus ganancias generen más ganancias solas. ¡Averigua más!",
      categoria: 'INVERSIÓN',
      impacto: 'ALTO',
      colorIcono: "text-violet-500",
      bgIcono: "bg-violet-50 border-violet-100",
      icono: TrendingUp
    }
  ]);

  // 3. Filtrado lógico de consejos en pantalla
  const consejosFiltrados = categoriaActiva === 'TODOS' 
    ? consejos 
    : consejos.filter(c => c.categoria === categoriaActiva);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-slate-800">
      
      {/* HEADER PRINCIPAL */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Sugerencias Inteligentes</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">Consejos & Educación</h1>
        <p className="text-sm text-slate-500 mt-1">Recomendaciones personalizadas para mejorar la salud de tus finanzas.</p>
      </div>

      {/* BOTONES DE FILTRADO (TABS) */}
      <div className="flex flex-wrap gap-2">
        {['TODOS', 'ALERTA', 'AHORRO', 'INVERSIÓN', 'GENERAL'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaActiva(cat)}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all active:scale-95 ${
              categoriaActiva === cat
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'TODOS' ? 'Ver Todo' : cat}
          </button>
        ))}
      </div>

      {/* DETECTOR / RESUMEN */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-indigo-400" />
            Tu Diagnóstico de Salud Financiera
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Nuestro sistema analiza tus presupuestos mensuales y tus metas en tiempo real. Actualmente tienes 1 alerta crítica que requiere tu atención para no cerrar el mes en negativo.
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center md:text-right">
          <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-300 block">Puntaje del Mes</span>
          <span className="text-2xl font-black text-white">82 / 100</span>
        </div>
      </div>

      {/* LISTA DINÁMICA DE CONSEJOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consejosFiltrados.map((c) => (
          <div 
            key={c.id} 
            className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              {/* Top de la Tarjeta */}
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${c.bgIcono}`}>
                  <c.icono className={`w-5 h-5 ${c.colorIcono}`} />
                </div>
                
                {/* Etiqueta de Prioridad / Impacto */}
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md ${
                  c.impacto === 'ALTO' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                  c.impacto === 'MEDIO' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  IMPACTO {c.impacto}
                </span>
              </div>

              {/* Contenido */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base leading-snug">{c.titulo}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{c.descripcion}</p>
              </div>
            </div>

            {/* Enlace o botón de acción */}
            <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer group">
              <span>Aprender más sobre esto</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>

          </div>
        ))}

        {/* Mensaje en caso de que un filtro esté vacío */}
        {consejosFiltrados.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-400 font-medium">No hay consejos en esta categoría por el momento.</p>
          </div>
        )}
      </div>

    </div>
  );
}