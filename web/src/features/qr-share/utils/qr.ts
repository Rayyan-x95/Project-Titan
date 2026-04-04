function hashString(input: string) {
  let hash = 5381

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(index)
    hash = hash >>> 0
  }

  return hash
}

function toSvgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function buildQrImageUrl(value: string, size = 280) {
  const gridSize = 21
  const cellSize = Math.floor((size - 48) / gridSize)
  const renderedSize = cellSize * gridSize
  const offset = Math.floor((size - renderedSize) / 2)
  const seed = hashString(value)

  const cells: string[] = []
  for (let row = 0; row < gridSize; row += 1) {
    for (let col = 0; col < gridSize; col += 1) {
      const inFinderZone =
        (row < 7 && col < 7) ||
        (row < 7 && col >= gridSize - 7) ||
        (row >= gridSize - 7 && col < 7)

      const on = inFinderZone
        ? (row === 0 || row === 6 || col === 0 || col === 6 || (row >= 2 && row <= 4 && col >= 2 && col <= 4))
        : ((hashString(`${seed}:${row}:${col}`) & 1) === 0)

      if (on) {
        cells.push(
          `<rect x="${offset + col * cellSize}" y="${offset + row * cellSize}" width="${cellSize}" height="${cellSize}" rx="1" fill="#edf3ff" />`,
        )
      }
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 56}" viewBox="0 0 ${size} ${size + 56}" role="img" aria-label="Titan share code">
      <rect width="100%" height="100%" rx="24" fill="#0b0f12" />
      <rect x="16" y="16" width="${size - 32}" height="${size - 32}" rx="18" fill="#111827" stroke="rgba(255,255,255,0.08)" />
      <rect x="${offset - 8}" y="${offset - 8}" width="${renderedSize + 16}" height="${renderedSize + 16}" rx="16" fill="#f8fafc" />
      ${cells.join('')}
      <text x="50%" y="${size + 28}" text-anchor="middle" fill="#edf3ff" font-family="system-ui, sans-serif" font-size="14" font-weight="700">Titan share code</text>
      <text x="50%" y="${size + 46}" text-anchor="middle" fill="rgba(237,243,255,0.7)" font-family="system-ui, sans-serif" font-size="10">${value.slice(0, 42)}</text>
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
