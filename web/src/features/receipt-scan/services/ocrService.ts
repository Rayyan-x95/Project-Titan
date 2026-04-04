function compressImage(file: File, maxWidth = 1400) {
  return new Promise<Blob>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')

      if (!context) {
        reject(new Error('Canvas context unavailable'))
        return
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Compression failed'))
          return
        }
        resolve(blob)
      }, 'image/jpeg', 0.82)
    }

    image.onerror = () => reject(new Error('Image load failed'))
    image.src = URL.createObjectURL(file)
  })
}

function loadTesseractScript() {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-tesseract="true"]')
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
    script.async = true
    script.dataset.tesseract = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('OCR runtime failed to load'))
    document.head.appendChild(script)
  })
}

export async function runReceiptOcr(file: File) {
  const compressed = await compressImage(file)
  await loadTesseractScript()

  const tesseract = (window as Window & {
    Tesseract?: {
      createWorker: (language: string) => Promise<{
        recognize: (blob: Blob) => Promise<{ data: { text: string } }>
        terminate: () => Promise<void>
      }>
    }
  }).Tesseract

  if (!tesseract) {
    throw new Error('OCR runtime unavailable')
  }

  const worker = await tesseract.createWorker('eng')

  try {
    const { data } = await worker.recognize(compressed)
    return data.text as string
  } finally {
    await worker.terminate()
  }
}
