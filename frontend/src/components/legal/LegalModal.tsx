import { CheckCircle, FileText, Lock, Shield, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { POLITICA_PRIVACIDAD, TERMINOS_CONDICIONES, type LegalDocument } from '../../data/legalContent'

export type LegalTabType = 'terms' | 'privacy'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: LegalTabType
  onAccept?: () => void
  showAcceptButton?: boolean
}

export function LegalModal({
  isOpen,
  onClose,
  initialTab = 'terms',
  onAccept,
  showAcceptButton = true,
}: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab)

  // Sincronizar pestaña activa cuando se abre o cambia initialTab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  // Manejo de tecla ESC para cerrar modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const doc: LegalDocument = activeTab === 'terms' ? TERMINOS_CONDICIONES : POLITICA_PRIVACIDAD

  function handleAccept() {
    if (onAccept) onAccept()
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#0f2d6e] text-white shadow-md shadow-[#0f2d6e]/20">
              {activeTab === 'terms' ? <FileText className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {activeTab === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Versión {doc.version} • Actualizado: {doc.lastUpdated}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selector de Pestañas (Tabs) */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'terms'
                ? 'border-[#2563eb] text-[#2563eb]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            Términos de Uso
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'privacy'
                ? 'border-[#2563eb] text-[#2563eb]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="h-4 w-4" />
            Privacidad y Datos
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Resumen destacado */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-blue-900">
            <div className="flex items-start gap-2.5">
              <Lock className="h-4 w-4 text-[#2563eb] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-medium leading-normal">{doc.summary}</p>
            </div>
          </div>

          {/* Secciones del documento */}
          <div className="space-y-4 pt-1">
            {doc.sections.map((section) => (
              <div key={section.id} className="space-y-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                  {section.title}
                </h3>
                {section.highlight && (
                  <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-[11px] sm:text-xs font-semibold text-amber-900">
                    ⚠️ {section.highlight}
                  </div>
                )}
                <div className="space-y-1.5 text-slate-600 pl-3 border-l border-slate-100">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie del Modal con Acciones */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 px-5 py-3.5 border-t border-slate-100 bg-slate-50/80">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            FinanzasTrack © {new Date().getFullYear()} • Plataforma Segura
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200/70 transition"
            >
              Cerrar
            </button>
            {showAcceptButton && (
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0f2d6e] hover:bg-[#1a3d7c] shadow-md shadow-[#0f2d6e]/20 transition"
              >
                <CheckCircle className="h-4 w-4" />
                Aceptar y Continuar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
