import { buildQrImageUrl } from '../utils/qr'

export function createQrSharePayload(title: string, summary: string, url?: string) {
  return JSON.stringify({
    title,
    summary,
    url: url ?? '',
    createdAt: Date.now(),
  })
}

export function createQrImage(value: string) {
  return buildQrImageUrl(value)
}
