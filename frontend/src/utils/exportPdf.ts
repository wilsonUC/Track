import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

export interface ExportPdfOptions {
  filename: string
  title?: string
  dateLabel?: string
}

/**
 * Captura un elemento del DOM usando html-to-image (compatible con Tailwind v4 / oklch / SVG)
 * y descarga el documento en PDF con jsPDF.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportPdfOptions,
): Promise<void> {
  // 1. Asegurar carga de fuentes
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready
  }

  // 2. Generar imagen PNG en alta definición (pixelRatio: 2)
  const imgData = await toPng(element, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: '#f8fafc',
    cacheBust: true,
  })

  // 3. Obtener dimensiones naturales de la captura
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('No se pudo procesar la captura de imagen'))
    img.src = imgData
  })

  const imgWidth = img.width
  const imgHeight = img.height

  // 4. Determinar orientación A4 según la proporción
  const isLandscape = imgWidth >= imgHeight
  const orientation = isLandscape ? 'landscape' : 'portrait'

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const margin = 8
  const maxContentWidth = pageWidth - margin * 2
  const maxContentHeight = pageHeight - margin * 2

  const widthRatio = maxContentWidth / imgWidth
  const renderedWidth = maxContentWidth
  const renderedHeight = imgHeight * widthRatio

  // 5. Agregar imagen al PDF
  if (renderedHeight <= maxContentHeight) {
    // Si cabe en una sola hoja, centrar verticalmente
    const posY = Math.max(margin, (pageHeight - renderedHeight) / 2)
    pdf.addImage(imgData, 'PNG', margin, posY, renderedWidth, renderedHeight, undefined, 'FAST')
  } else {
    // Si excede una página, paginar progresivamente
    let heightLeft = renderedHeight
    let position = margin

    pdf.addImage(imgData, 'PNG', margin, position, renderedWidth, renderedHeight, undefined, 'FAST')
    heightLeft -= maxContentHeight

    while (heightLeft > 0) {
      position = -(renderedHeight - heightLeft) + margin
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', margin, position, renderedWidth, renderedHeight, undefined, 'FAST')
      heightLeft -= maxContentHeight
    }
  }

  // 6. Guardar archivo
  const cleanFilename = options.filename.endsWith('.pdf')
    ? options.filename
    : `${options.filename}.pdf`

  pdf.save(cleanFilename)
}
