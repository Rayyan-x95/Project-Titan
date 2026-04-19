import qrcode from 'qrcode-generator'

function toSvgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function buildQrImageUrl(value: string, size = 280) {
  const qrValue = value.trim() || 'https://titanapp.qzz.io/'
  const qr = qrcode(0, 'M')
  qr.addData(qrValue)
  qr.make()

  const moduleCount = qr.getModuleCount()
  const quietZone = 4
  const moduleSpan = moduleCount + quietZone * 2
  const cellSize = Math.max(Math.floor((size - 56) / moduleSpan), 4)
  const renderedSize = cellSize * moduleSpan
  const offset = Math.floor((size - renderedSize) / 2)

  const cells: string[] = []
  for (let row = -quietZone; row < moduleCount + quietZone; row += 1) {
    for (let col = -quietZone; col < moduleCount + quietZone; col += 1) {
      const isInsideQr = row >= 0 && row < moduleCount && col >= 0 && col < moduleCount
      const isDark = isInsideQr ? qr.isDark(row, col) : false

      if (isDark) {
        const x = offset + (col + quietZone) * cellSize
        const y = offset + (row + quietZone) * cellSize
        cells.push(
          `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="1" fill="#0f172a" />`,
        )
      }
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 56}" viewBox="0 0 ${size} ${size + 56}" role="img" aria-label="Titan QR code">
      <rect width="100%" height="100%" rx="24" fill="#0b0f12" />
      <rect x="16" y="16" width="${size - 32}" height="${size - 32}" rx="18" fill="#111827" stroke="rgba(255,255,255,0.08)" />
      <rect x="${offset - 8}" y="${offset - 8}" width="${renderedSize + 16}" height="${renderedSize + 16}" rx="16" fill="#ffffff" />
      ${cells.join('')}
      <text x="50%" y="${size + 28}" text-anchor="middle" fill="#edf3ff" font-family="system-ui, sans-serif" font-size="14" font-weight="700">Titan QR</text>
      <text x="50%" y="${size + 46}" text-anchor="middle" fill="rgba(237,243,255,0.7)" font-family="system-ui, sans-serif" font-size="10">${escapeXml(qrValue.slice(0, 42))}</text>
    </svg>
  `.trim()

  return toSvgDataUrl(svg)
}

export async function downloadImageFromUrl(url: string, fileName: string) {
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    return
  }

  const response = await fetch(url)
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  anchor.click()

  URL.revokeObjectURL(objectUrl)
}
