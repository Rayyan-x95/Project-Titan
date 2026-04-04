export type SharePayload = {
  type: 'split-invite' | 'group-share' | 'budget-challenge' | 'expense-draft' | 'summary'
  version: number
  createdAt: number
  expiresAt?: number
  data: Record<string, unknown>
}

type EncodedShare = {
  payload: string
  sig: string
}

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 14
const SHARE_VERSION = 1

function toBase64Url(value: string) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  return atob(padded)
}

// Lightweight integrity hash (tamper-evident, not encryption).
function hashString(input: string) {
  let hash = 5381
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(index)
    hash = hash >>> 0
  }
  return hash.toString(16)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function encodeSharePayload(
  type: SharePayload['type'],
  data: Record<string, unknown>,
  ttlMs = DEFAULT_TTL_MS,
) {
  const now = Date.now()
  const payload: SharePayload = {
    type,
    version: SHARE_VERSION,
    createdAt: now,
    expiresAt: now + ttlMs,
    data,
  }

  const payloadRaw = JSON.stringify(payload)
  const encoded: EncodedShare = {
    payload: toBase64Url(payloadRaw),
    sig: hashString(payloadRaw),
  }

  return toBase64Url(JSON.stringify(encoded))
}

export function decodeSharePayload(token: string): SharePayload | null {
  try {
    const encoded = JSON.parse(fromBase64Url(token)) as EncodedShare
    if (!encoded || typeof encoded.payload !== 'string' || typeof encoded.sig !== 'string') {
      return null
    }

    const payloadRaw = fromBase64Url(encoded.payload)
    if (hashString(payloadRaw) !== encoded.sig) {
      return null
    }

    const payload = JSON.parse(payloadRaw) as SharePayload
    if (!payload || payload.version !== SHARE_VERSION || !isObject(payload.data)) {
      return null
    }

    if (payload.expiresAt && payload.expiresAt < Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function buildShareUrl(pathname: string, token: string) {
  const url = new URL(pathname, window.location.origin)
  url.searchParams.set('data', token)
  return url.toString()
}
