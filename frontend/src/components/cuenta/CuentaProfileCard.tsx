import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Camera,
  Crop,
  Loader2,
  LogOut,
  Mail,
  Maximize2,
  Phone,
  Shield,
  Trash2,
  User,
  X,
} from 'lucide-react'
import {
  profileFullName,
  removeProfilePhoto,
  uploadProfilePhoto,
  type UserProfile,
} from '../../api/auth'
import { AvatarCropperModal } from './AvatarCropperModal'

type CuentaProfileCardProps = {
  profile: UserProfile
  onLogout?: () => void
  onProfileUpdated?: (updated: UserProfile) => void
}

export function CuentaProfileCard({ profile, onLogout, onProfileUpdated }: CuentaProfileCardProps) {
  const fullName = profileFullName(profile)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Estados para el modal de alineación / recorte
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [cropFileName, setCropFileName] = useState('avatar.webp')
  const [pendingOriginalFile, setPendingOriginalFile] = useState<File | null>(null)

  // Cerrar lightbox con tecla Escape
  useEffect(() => {
    if (!isPreviewOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreviewOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPreviewOpen])

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPhotoError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setPhotoError('Por favor selecciona una imagen válida (JPG, PNG, WebP).')
      return
    }

    // Validar tamaño máx (10 MB para permitir fotos originales de alta resolución antes del recorte)
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('La imagen no debe superar los 10 MB.')
      return
    }

    setPhotoError(null)
    setCropFileName(file.name)
    setPendingOriginalFile(file)
    const objectUrl = URL.createObjectURL(file)
    setCropImageSrc(objectUrl)
    setCropModalOpen(true)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropComplete = async (croppedFile: File) => {
    try {
      setUploading(true)
      setPhotoError(null)
      const updated = await uploadProfilePhoto(croppedFile, pendingOriginalFile || undefined)
      onProfileUpdated?.(updated)
      if (cropImageSrc && cropImageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(cropImageSrc)
      }
      setCropImageSrc(null)
      setPendingOriginalFile(null)
      // Reabrir la previsualización con las 3 opciones una vez guardados los cambios
      setIsPreviewOpen(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al subir la imagen'
      setPhotoError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleOpenRealign = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!profile.foto) return
    setCropFileName('avatar.webp')
    setPendingOriginalFile(null)
    // Cargar la foto original completa (sin recortar) si existe, o la foto actual
    setCropImageSrc(profile.foto_original || profile.foto)
    setIsPreviewOpen(false)
    setCropModalOpen(true)
  }

  const handleDeletePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('¿Deseas eliminar tu foto de perfil?')) return
    try {
      setUploading(true)
      setPhotoError(null)
      const updated = await removeProfilePhoto()
      setIsPreviewOpen(false)
      onProfileUpdated?.(updated)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la foto'
      setPhotoError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarClick = () => {
    if (uploading) return
    if (profile.foto) {
      setIsPreviewOpen(true)
    } else {
      fileInputRef.current?.click()
    }
  }

  return (
    <article className="mx-auto w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-slate-200/80 ring-1 ring-slate-100 dark:bg-slate-800 dark:shadow-none dark:ring-slate-700">
      {/* Banner superior con altura y degradado idénticos en modo claro y modo oscuro */}
      <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-700 to-teal-500" aria-hidden />

      <div className="px-6 pb-7 pt-0">
        <div className="relative -mt-16 flex justify-center">
          <div className="relative group">
            {/* Input oculto para selección de imagen */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />

            {/* Marco del Avatar con gradiente armonizado y bisel de integración */}
            <div
              onClick={handleAvatarClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleAvatarClick()
                }
              }}
              tabIndex={0}
              role="button"
              title={profile.foto ? 'Haz clic para ver opciones de foto' : 'Haz clic para subir una foto'}
              className={`relative rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-teal-400 to-indigo-600 shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-indigo-500/35 dark:shadow-indigo-950/50 ${
                !uploading ? 'cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/40' : ''
              }`}
            >
              {/* Contenedor de la foto con borde limpio */}
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[3.5px] border-white bg-slate-100 dark:border-slate-800 dark:bg-slate-700">
                {profile.foto ? (
                  <>
                    <img
                      src={profile.foto}
                      alt={fullName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Icono sutil de lupa/ampliar al pasar el cursor */}
                    {!uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
                        <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
                      </div>
                    )}
                  </>
                ) : (
                  <User className="h-14 w-14 stroke-[1.25] text-indigo-600 dark:text-indigo-400" aria-hidden />
                )}

                {/* Overlay de carga */}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs text-white">
                    <Loader2 className="h-7 w-7 animate-spin text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Botón de Cámara flotante (solo si NO tiene foto aún) */}
            {!profile.foto && (
              <button
                type="button"
                onClick={handleCameraClick}
                disabled={uploading}
                title="Subir foto de perfil"
                className="absolute bottom-1 right-1 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white shadow-md shadow-teal-600/30 ring-2 ring-white transition-all hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-slate-800"
                aria-label="Subir foto de perfil"
              >
                <Camera className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>

        {/* Mensaje de error si falla la subida */}
        {photoError && (
          <p className="mt-2 text-center text-xs font-semibold text-rose-600 dark:text-rose-400">
            {photoError}
          </p>
        )}

        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold tracking-tight text-[#1e3a8a] dark:text-slate-100">
            {fullName}
          </h2>
          <p className="mt-0.5 text-sm font-medium text-slate-400 dark:text-slate-400">
            @{profile.username}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${
              profile.tipo_cuenta === 'avanzado'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {profile.tipo_cuenta_label || (profile.tipo_cuenta === 'avanzado' ? 'Plan Avanzado' : 'Plan Básico')}
            </span>

            {/* Badge de Vigencia */}
            {profile.fecha_expiracion ? (() => {
              const d = new Date(profile.fecha_expiracion)
              const isValid = !isNaN(d.getTime())
              const isTime = profile.fecha_expiracion.includes('T')
              const formatted = isValid
                ? (isTime
                    ? `${d.toLocaleDateString('es-PE', { dateStyle: 'short' })} ${d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`
                    : d.toLocaleDateString('es-PE', { dateStyle: 'medium' }))
                : profile.fecha_expiracion
              const isExpired = profile.is_expired || (isValid && d.getTime() <= Date.now())

              return (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${
                  isExpired
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : (profile.dias_restantes ?? 99) <= 7
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                  {isExpired
                    ? `Expiró (${formatted})`
                    : `Vence: ${formatted}`}
                </span>
              )
            })() : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold tracking-wide text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                Acceso Permanente ♾️
              </span>
            )}
          </div>
        </div>

        <div className="mx-1 mt-6 border-t border-slate-100 dark:border-slate-700" />

        <ul className="mt-5 space-y-4">
          <li className="flex items-center gap-3">
            <Mail className="h-[18px] w-[18px] shrink-0 stroke-[1.5] text-slate-400" aria-hidden />
            <span className="min-w-0 truncate text-sm font-medium text-slate-600 dark:text-slate-300">
              {profile.email || '—'}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Phone className="h-[18px] w-[18px] shrink-0 stroke-[1.5] text-slate-400" aria-hidden />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {profile.telefono || '—'}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <User className="h-[18px] w-[18px] shrink-0 stroke-[1.5] text-slate-400" aria-hidden />
            <span className="min-w-0 truncate text-sm font-medium text-slate-600 dark:text-slate-300">
              Usuario: {profile.username}
            </span>
          </li>
        </ul>

        {onLogout && (
          <div className="mt-6 pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/80 py-3 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-100 active:scale-95 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60"
            >
              <LogOut className="h-4 w-4 stroke-[2.25]" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {/* Modal / Lightbox de Previsualización en Alta Resolución adaptativo a Modo Claro y Oscuro */}
      {isPreviewOpen && profile.foto && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Previsualización de foto de perfil"
        >
          <div
            className="relative flex max-h-[90vh] max-w-lg flex-col items-center overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900/95 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white active:scale-95"
              aria-label="Cerrar previsualización"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Imagen en grande con borde y marco armónico */}
            <div className="relative rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-teal-400 to-indigo-600 shadow-2xl">
              <div className="flex h-64 w-64 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-inner dark:border-slate-800 dark:bg-slate-800 sm:h-72 sm:w-72">
                <img
                  src={profile.foto}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Detalles del usuario */}
            <div className="mt-5 text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{fullName}</h3>
              <p className="mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-400 sm:text-sm">@{profile.username}</p>
            </div>

            {/* Acciones dentro del modal */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenRealign}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500 active:scale-95 sm:text-sm"
              >
                <Crop className="h-4 w-4" />
                Ajustar encuadre
              </button>
              <button
                type="button"
                onClick={handleCameraClick}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 active:scale-95 sm:text-sm"
              >
                <Camera className="h-4 w-4" />
                Subir nueva
              </button>
              <button
                type="button"
                onClick={handleDeletePhoto}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 active:scale-95 sm:text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar foto
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal interactivo de Alineación, Zoom y Recorte de Avatar */}
      <AvatarCropperModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        fileName={cropFileName}
        onClose={() => {
          setCropModalOpen(false)
          if (cropImageSrc && cropImageSrc.startsWith('blob:')) {
            URL.revokeObjectURL(cropImageSrc)
          }
          setCropImageSrc(null)
        }}
        onCropComplete={handleCropComplete}
      />
    </article>
  )
}
