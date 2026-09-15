import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { Loader2 } from 'lucide-react'

interface GoogleSignInButtonProps {
  onSuccess: (accessToken: string) => void | Promise<void>
  onError: (errorMsg: string) => void
  text?: string
  disabled?: boolean
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  text = 'Continuar con Google',
  disabled = false,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false)

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true)
        await onSuccess(tokenResponse.access_token)
      } catch {
        // handled in parent onSuccess
      } finally {
        setLoading(false)
      }
    },
    onError: (errorResponse) => {
      setLoading(false)
      const message = errorResponse.error_description || 'No se pudo completar el acceso con Google.'
      onError(message)
    },
  })

  const handleClick = () => {
    if (disabled || loading) return
    login()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={text}
      className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/80 hover:text-slate-900 hover:shadow-md active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-[#1d4ed8]" />
          <span className="text-slate-600">Conectando con Google…</span>
        </>
      ) : (
        <>
          {/* Google Official 4-Color Icon */}
          <svg className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27A7.16 7.16 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.97 11.97 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="tracking-tight">{text}</span>
        </>
      )}
    </button>
  )
}
