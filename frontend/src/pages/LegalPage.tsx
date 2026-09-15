import { ArrowLeft, CheckCircle, FileText, Lock, Shield } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import brandLogo from '../assets/brand/v4.svg'
import { POLITICA_PRIVACIDAD, TERMINOS_CONDICIONES, type LegalDocument } from '../data/legalContent'

interface LegalPageProps {
  forcedType?: 'terms' | 'privacy'
}

export function LegalPage({ forcedType }: LegalPageProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // Determinar si muestra términos o privacidad según ruta o prop
  const isPrivacy = forcedType === 'privacy' || location.pathname.includes('privacidad')
  const doc: LegalDocument = isPrivacy ? POLITICA_PRIVACIDAD : TERMINOS_CONDICIONES

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200/80 px-4 py-8 text-slate-800 antialiased sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Navegación y Cabecera de Marca */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#0f2d6e] p-1.5 shadow-md shadow-[#0f2d6e]/20">
              <img src={brandLogo} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-base font-black tracking-tight text-[#0f2d6e]">FinanzasTrack</span>
          </Link>
        </div>

        {/* Tarjeta Principal de Contenido */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
          {/* Header del documento */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100/80 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-blue-800 uppercase">
                {isPrivacy ? <Shield className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                Documento Legal
              </span>
              <span className="text-xs text-slate-400 font-medium">Versión {doc.version}</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {doc.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{doc.subtitle}</p>
            <p className="mt-2 text-xs text-slate-400 font-medium">
              Última actualización: {doc.lastUpdated}
            </p>

            {/* Selector entre Términos y Privacidad */}
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200/70 pt-4">
              <Link
                to="/terminos"
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  !isPrivacy
                    ? 'bg-[#0f2d6e] text-white shadow-md shadow-[#0f2d6e]/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Términos y Condiciones
              </Link>
              <Link
                to="/privacidad"
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  isPrivacy
                    ? 'bg-[#0f2d6e] text-white shadow-md shadow-[#0f2d6e]/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                Política de Privacidad
              </Link>
            </div>
          </div>

          {/* Resumen */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-blue-950">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-[#2563eb] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-medium leading-relaxed">{doc.summary}</p>
              </div>
            </div>

            {/* Listado de Secciones */}
            <div className="space-y-6 pt-2 divide-y divide-slate-100">
              {doc.sections.map((section) => (
                <div key={section.id} className="pt-6 first:pt-0 space-y-2.5">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                    {section.title}
                  </h2>
                  {section.highlight && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-amber-900">
                      ⚠️ {section.highlight}
                    </div>
                  )}
                  <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-4 border-l-2 border-slate-100">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer interno */}
            <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Documentación oficial y vigente de FinanzasTrack</span>
              </div>
              <div className="flex gap-4">
                <Link to="/register" className="font-semibold text-[#2563eb] hover:underline">
                  Crear cuenta
                </Link>
                <Link to="/login" className="font-semibold text-[#2563eb] hover:underline">
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
