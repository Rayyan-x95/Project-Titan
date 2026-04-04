export function buildQrImageUrl(value: string, size = 280) {
  const encoded = encodeURIComponent(value)
  // External service keeps the app bundle tiny and avoids a heavy QR dependency.
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`
}

export async function downloadImageFromUrl(url: string, fileName: string) {
  const response = await fetch(url)
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  anchor.click()

  URL.revokeObjectURL(objectUrl)
}
