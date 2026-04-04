import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseShareLinkValue } from '../services/shareLinkService'

export function useSharePayload() {
  const [searchParams] = useSearchParams()
  const rawPayload = searchParams.get('data')

  return useMemo(() => parseShareLinkValue(rawPayload), [rawPayload])
}
