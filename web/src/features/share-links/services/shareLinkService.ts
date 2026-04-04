import { buildShareUrl, decodeSharePayload, encodeSharePayload, type SharePayload } from '../utils/shareLinks'

export function createShareLink(type: SharePayload['type'], pathname: string, data: Record<string, unknown>) {
  const token = encodeSharePayload(type, data)
  return buildShareUrl(pathname, token)
}

export function parseShareLinkValue(value: string | null) {
  if (!value) {
    return null
  }

  return decodeSharePayload(value)
}
