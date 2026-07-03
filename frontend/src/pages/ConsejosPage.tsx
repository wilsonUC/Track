import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Loader2,
  PiggyBank,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { fetchConsejos, type ConsejoItem, type ConsejosResponse } from '../api/consejos'
import { sectionPaths } from '../constants/routes'
import {
  consejoImpactoClass,
  formatConsejosFecha,
  getConsejoVisual,
} from '../utils/consejosUi'

const FILTROS = ['TODOS', 'ALERTA', 'AHORRO', 'INVERSIÓN', 'GENERAL'] as const

export function ConsejosPage() {
  const navigate = useNavigate()
  const [categoriaActiva, setCategoriaActiva] = useState<string>('TODOS')
  const [data, setData] = useState<ConsejosResponse | null>(null)
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [error, setError] = useState('')

  const cargar = useCallback(async (regenerar = false) => {
    if (regenerar) {
      setActualizando(true)
    } else {
      setCargando(true)
    }
    setError('')
    try {
      const response = await fetchConsejos(regenerar)
      setData(response)
    } catch (err) {
      const detalle = err instanceof Error ? err.message : 'Error desconocido'
      setError(detalle)
    } finally {
      setCargando(false)
      setActualizando(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const consejos = data?.consejos ?? []
  const consejosFiltrados =
    categoriaActiva === 'TODOS'
      ? consejos
      : consejos.filter((c) => c.categoria === categoriaActiva)

  const irAprenderMas = (consejo: ConsejoItem) => {
    navigate(sectionPaths.ia, {
      state: { preguntaSugerida: consejo.pregunta_ia },
    })
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Sugerencias Inteligentes</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">Consejos & Educación</h1>
            <p className="text-sm text-slate-500 mt-1">
              Recomendaciones personalizadas generadas con IA según tus datos reales.
            </p>
            {data?.generado_en && (
              <p className="text-xs text-slate-400 mt-2">
                Última actualización: {formatConsejosFecha(data.generado_en)}
                {data.desde_cache ? ' (desde caché)' : ''}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void cargar(true)}
            disabled={cargando || actualizando}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actualizando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualizar consejos
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((cat) => (
          <button
            key={cat}
            type="button"
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

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-indigo-400" />
            Tu Diagnóstico de Salud Financiera
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            {cargando && !data
              ? 'Analizando tus presupuestos, metas y transacciones...'
              : data?.resumen ?? 'Genera tus consejos para ver un diagnóstico personalizado.'}
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center md:text-right min-w-[120px]">
          <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-300 block">
            Puntaje del Mes
          </span>
          {cargando && !data ? (
            <Loader2 className="mx-auto mt-1 h-6 w-6 animate-spin text-white" />
          ) : (
            <span className="text-2xl font-black text-white">{data?.puntaje ?? '—'} / 100</span>
          )}
        </div>
      </div>

      {cargando && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-2xl border border-slate-100 bg-white"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {consejosFiltrados.map((c, index) => {
            const visual = getConsejoVisual(c.categoria)
            const Icono = visual.icono

            return (
              <div
                key={`${c.titulo}-${index}`}
                className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${visual.bgIcono}`}>
                      <Icono className={`w-5 h-5 ${visual.colorIcono}`} />
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-md ${consejoImpactoClass(c.impacto)}`}
                    >
                      IMPACTO {c.impacto}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-base leading-snug">{c.titulo}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{c.descripcion}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => irAprenderMas(c)}
                  className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700 group"
                >
                  <span>Aprender más sobre esto</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )
          })}

          {!cargando && consejosFiltrados.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-400 font-medium">
                No hay consejos en esta categoría por el momento.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
