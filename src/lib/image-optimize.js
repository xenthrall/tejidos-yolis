const MAX_DIMENSION = 1600
const QUALITY = 0.82
const OUTPUT_TYPE = 'image/webp'

const EXTENSION_BY_MIME = {
  'image/webp': 'webp',
  'image/png': 'png',
  'image/jpeg': 'jpg',
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen.'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen.'))), type, quality)
  })
}

// Resizes to at most MAX_DIMENSION on the longest side and re-encodes as
// WebP entirely in the browser, so large camera photos never hit Supabase
// Storage at full size. Falls back to whatever canvas.toBlob actually
// produced (some older browsers silently return PNG instead of WebP).
export async function optimizeImage(file) {
  const img = await loadImage(file)

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)

  const blob = await canvasToBlob(canvas, OUTPUT_TYPE, QUALITY)
  const extension = EXTENSION_BY_MIME[blob.type] ?? 'jpg'
  const baseName = file.name.replace(/\.[^./\\]+$/, '') || 'imagen'

  return new File([blob], `${baseName}.${extension}`, { type: blob.type })
}
