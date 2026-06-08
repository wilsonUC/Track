import { useState } from 'react';
import { BarChart3, PieChart, Download } from 'lucide-react';

export default function ReportesPage() {
  // 1. Estado para controlar qué pestaña está activa (visto en image_5ce01f.png)
  const [tipoReporte, setTipoReporte] = useState<'todos' | 'ingresos' | 'gastos'>('todos');

  // Datos base que simulan lo que viene de tu PostgreSQL
  const todasLasCategorias = [
    { nombre: "Sueldo Principal", total: "S/ 4,500.00", valorNum: 4500, porcentaje: "60.8%", tipo: "ingreso", color: "bg-emerald-500" },
    { nombre: "Comisiones", total: "S/ 2,500.00", valorNum: 2500, porcentaje: "33.7%", tipo: "ingreso", color: "bg-teal-500" },
    { nombre: "Alimentación", total: "S/ 1,200.00", valorNum: 1200, porcentaje: "16.2%", tipo: "gasto", color: "bg-rose-500" },
    { nombre: "Servicios (Luz, Agua)", total: "S/ 800.00", valorNum: 800, porcentaje: "10.8%", tipo: "gasto", color: "bg-violet-500" },
    { nombre: "Transporte en Scooter", total: "S/ 400.00", valorNum: 400, porcentaje: "5.4%", tipo: "gasto", color: "bg-amber-500" },
    { nombre: "Educación y Libros", total: "S/ 180.00", valorNum: 180, porcentaje: "2.4%", tipo: "gasto", color: "bg-blue-500" },
  ];

  // Histórico mensual de barras
  const datosGraficoMensual = [
    { mes: 'Ene', ing: 2400, gas: 1600, hIng: 'h-24', hGas: 'h-16' },
    { mes: 'Feb', ing: 2800, gas: 2000, hIng: 'h-28', hGas: 'h-20' },
    { mes: 'Mar', ing: 5100, gas: 2910, hIng: 'h-40', hGas: 'h-32' },
    { mes: 'Abr', ing: 4500, gas: 2400, hIng: 'h-32', hGas: 'h-24' },
    { mes: 'May', ing: 3600, gas: 1800, hIng: 'h-26', hGas: 'h-18' },
    { mes: 'Jun', ing: 2500, gas: 1200, hIng: 'h-20', hGas: 'h-10' }
  ];

  // 2. Lógica de Filtrado en tiempo real
  const categoriasFiltradas = todasLasCategorias.filter(cat => {
    if (tipoReporte === 'todos') return true;
    return cat.tipo === (tipoReporte === 'ingresos' ? 'ingreso' : 'gasto');
  });

  // Función simulada para el botón "Exportar Reporte" de image_5ce01f.png
  const manejarExportar = () => {
    alert(`Generando reporte en formato PDF/Excel con el filtro activo: [${tipoReporte.toUpperCase()}]...`);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-slate-800">
      
      {/* HEADER CON FILTROS FUNCIONALES */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reportes Avanzados</h1>
          <p className="text-sm text-slate-500 mt-1">Análisis reactivo de tu base de datos de finanzas.</p>
        </div>
        
        {/* Controles de Filtros idénticos a image_5ce01f.png */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <button 
              onClick={() => setTipoReporte('todos')}
              className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${tipoReporte === 'todos' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Todo
            </button>
            <button 
              onClick={() => setTipoReporte('ingresos')}
              className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${tipoReporte === 'ingresos' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Ingresos
            </button>
            <button 
              onClick={() => setTipoReporte('gastos')}
              className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${tipoReporte === 'gastos' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Gastos
            </button>
          </div>

          {/* Botón Exportar Reporte Funcional */}
          <button 
            onClick={manejarExportar}
            className="flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICOS MAQUETADOS REACTIVOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico Histórico Comparativo */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800">
                Historial: {tipoReporte === 'todos' ? 'Ingresos vs Gastos' : tipoReporte === 'ingresos' ? 'Solo Ingresos' : 'Solo Gastos'}
              </h2>
            </div>
            
            {/* Leyendas inteligentes que cambian según el filtro */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              {(tipoReporte === 'todos' || tipoReporte === 'ingresos') && (
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Ingresos</div>
              )}
              {(tipoReporte === 'todos' || tipoReporte === 'gastos') && (
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span> Gastos</div>
              )}
            </div>
          </div>
          
          {/* Simulación visual de barras reactivas */}
          <div className="h-48 flex items-end justify-between px-6 border-b border-slate-100 pb-2">
            {datosGraficoMensual.map((b, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 w-12">
                <div className="flex items-end gap-2 h-36 w-full justify-center">
                  {/* Barra Verde (Ingresos) - Se oculta si se filtra por Gastos */}
                  {(tipoReporte === 'todos' || tipoReporte === 'ingresos') && (
                    <div className={`${b.hIng} w-4 bg-emerald-400 rounded-t-sm transition-all duration-300 hover:bg-emerald-500 relative group cursor-pointer`}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        S/ {b.ing}
                      </div>
                    </div>
                  )}
                  {/* Barra Roja (Gastos) - Se oculta si se filtra por Ingresos */}
                  {(tipoReporte === 'todos' || tipoReporte === 'gastos') && (
                    <div className={`${b.hGas} w-4 bg-rose-400 rounded-t-sm transition-all duration-300 hover:bg-rose-500 relative group cursor-pointer`}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        S/ {b.gas}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-400">{b.mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico Dinámico de Dona */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Distribución de Impacto</h2>
          </div>
          
          {/* Círculo de dona que cambia de color según el filtro seleccionado */}
          <div className="flex justify-center items-center my-2">
            <div className={`w-32 h-32 rounded-full border-[14px] transition-all duration-300 flex items-center justify-center rotate-45 ${
              tipoReporte === 'todos' ? 'border-indigo-500 border-t-rose-500 border-r-emerald-500' :
              tipoReporte === 'ingresos' ? 'border-emerald-400 border-t-teal-500' : 'border-rose-400 border-t-violet-500 border-r-amber-500'
            }`}>
              <div className="text-center -rotate-45">
                <span className="text-xs font-extrabold text-slate-700 block capitalize">{tipoReporte}</span>
                <span className="text-[10px] text-slate-400 font-medium">Filtrado</span>
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 font-medium">
            Mostrando las categorías con mayor movimiento.
          </div>
        </div>
      </div>

      {/* TABLA DE CATEGORÍAS TOTALMENTE FILTRADA */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Desglose Detallado por Categoría</h2>
            <p className="text-xs text-slate-400 mt-0.5">Viendo {categoriasFiltradas.length} registros basados en el filtro superior.</p>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase">
            {tipoReporte}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="pb-3 w-2/5">Categoría</th>
                <th className="pb-3 text-center">Tipo</th>
                <th className="pb-3 text-center">Peso Relativo</th>
                <th className="pb-3 text-right pr-4">Total Acumulado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categoriasFiltradas.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors animate-fadeIn">
                  <td className="py-3.5 font-semibold text-slate-700 flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></span>
                    {cat.nombre}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      cat.tipo === 'ingreso' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {cat.tipo}
                    </span>
                  </td>
                  <td className="py-3.5 text-center text-slate-500 font-bold">
                    {cat.porcentaje}
                  </td>
                  <td className={`py-3.5 text-right font-black pr-4 ${
                    cat.tipo === 'ingreso' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {cat.tipo === 'ingreso' ? '+' : '-'}{cat.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}