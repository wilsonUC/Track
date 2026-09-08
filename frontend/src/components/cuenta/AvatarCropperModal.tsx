import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Loader2, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react'

type AvatarCropperModalProps = {
  isOpen: boolean
  imageSrc: string | null
  fileName?: string
  onClose: () => void
  onCropComplete: (croppedFile: File) => Promise<void>
}

const VIEWPORT_SIZE = 280 // Tamaño del círculo visible en px (diámetro)
const OUTPUT_SIZE = 500 // Tamaño de la imagen final guardada en px

export function AvatarCropperModal({
  isOpen,
  imageSrc,
  fileName = 'avatar.webp',
  onClose,
  onCropComplete,
}: AvatarCropperModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 })
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cargar imagen de forma segura como Blob local para evitar problemas de CORS en Canvas
  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setLocalBlobUrl(null)
      return
    }

    let isMounted = true
    let createdUrl: string | null = null

    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setIsSubmitting(false)
    setImageLoaded(false)
    setErrorMsg(null)

    if (imageSrc.startsWith('blob:') || imageSrc.startsWith('data:')) {
      setLocalBlobUrl(imageSrc)
    } else {
      // Para URLs remotas (ej. http://127.0.0.1:8000/media/...), convertirlas a Blob local
      fetch(imageSrc, { mode: 'cors' })
        .then((res) => {
          if (!res.ok) throw new Error('No se pudo cargar la imagen para encuadrar')
          return res.blob()
        })
        .then((blob) => {
          if (isMounted) {
            createdUrl = URL.createObjectURL(blob)
            setLocalBlobUrl(createdUrl)
          }
        })
        .catch((err) => {
          console.warn('Error fetching image as blob, using direct URL:', err)
          if (isMounted) setLocalBlobUrl(imageSrc)
        })
    }

    return () => {
      isMounted = false
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [isOpen, imageSrc])

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  // Drag con Ratón
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Drag Touch para móviles
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Zoom con rueda del ratón
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.0012
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 3.5))
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImgNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
    setImageLoaded(true)
  }

  // Calcular dimensiones base de visualización ('cover' exacto)
  const baseScale =
    imgNaturalSize.width > 0 && imgNaturalSize.height > 0
      ? Math.max(VIEWPORT_SIZE / imgNaturalSize.width, VIEWPORT_SIZE / imgNaturalSize.height)
      : 1

  const currentDisplayWidth = imgNaturalSize.width * baseScale * zoom
  const currentDisplayHeight = imgNaturalSize.height * baseScale * zoom

  // Aplicar encuadre y generar recorte con Canvas
  const handleApplyCrop = async () => {
    if (!imageRef.current || !imageLoaded) return

    try {
      setIsSubmitting(true)
      setErrorMsg(null)
      const img = imageRef.current

      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No se pudo inicializar el lienzo de recorte')

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

      // Escala entre la visualización en pantalla y la resolución final del canvas
      const ratio = OUTPUT_SIZE / VIEWPORT_SIZE

      // Trasladar al centro del canvas
      ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2)

      // Trasladar por el desplazamiento del usuario
      ctx.translate(position.x * ratio, position.y * ratio)

      // Aplicar rotación
      ctx.rotate((rotation * Math.PI) / 180)

      // Dimensiones proporcionales en el canvas
      const dw = img.naturalWidth * baseScale * zoom * ratio
      const dh = img.naturalHeight * baseScale * zoom * ratio

      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)

      // Exportar en formato WebP optimizado
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/webp', 0.92)
      })

      if (!blob) throw new Error('Error al procesar la imagen')

      const finalName = fileName.replace(/\.[^/.]+$/, '') + '.webp'
      const croppedFile = new File([blob], finalName, { type: 'image/webp' })

      await onCropComplete(croppedFile)
      onClose()
    } catch (err: unknown) {
      console.error('Crop error:', err)
      const msg = err instanceof Error ? err.message : 'Error al recortar la imagen'
      setErrorMsg(msg)
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !imageSrc) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Ajustar y recortar foto de perfil"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900/95 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">Ajustar encuadre</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Arrastra para mover y usa el zoom para encuadrar</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visor circular interactivo */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
            className="relative cursor-grab overflow-hidden rounded-full border-4 border-indigo-500 bg-slate-100 shadow-2xl select-none active:cursor-grabbing dark:bg-slate-950 ring-4 ring-indigo-500/20"
          >
            {localBlobUrl && (
              <img
                ref={imageRef}
                src={localBlobUrl}
                crossOrigin="anonymous"
                alt="Ajuste de avatar"
                onLoad={handleImageLoad}
                draggable={false}
                style={{
                  width: `${currentDisplayWidth}px`,
                  height: `${currentDisplayHeight}px`,
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) rotate(${rotation}deg)`,
                  position: 'absolute',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  display: imageLoaded ? 'block' : 'none',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Guía visual (cuadrícula de tercios) */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-25">
              <div className="border-r border-b border-white/80 dark:border-white/60" />
              <div className="border-r border-b border-white/80 dark:border-white/60" />
              <div className="border-b border-white/80 dark:border-white/60" />
              <div className="border-r border-b border-white/80 dark:border-white/60" />
              <div className="border-r border-b border-white/80 dark:border-white/60" />
              <div className="border-b border-white/80 dark:border-white/60" />
              <div className="border-r border-b border-white/80 dark:border-white/60" />
              <div className="border-r border-b border-white/80 dark:border-white/60" />
              <div />
            </div>

            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            )}
          </div>
          <span className="mt-2.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            🖱️ Arrastra la imagen dentro del círculo para centrar
          </span>
        </div>

        {/* Mensaje de error si ocurre */}
        {errorMsg && (
          <p className="mb-3 text-center text-xs font-semibold text-rose-600 dark:text-rose-400">
            {errorMsg}
          </p>
        )}

        {/* Controles de Zoom y Rotación */}
        <div className="space-y-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
              aria-label="Nivel de zoom"
            />
            <ZoomIn className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Rotar 90°
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Restablecer
            </button>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-95 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isSubmitting || !imageLoaded}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Aplicar y Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
