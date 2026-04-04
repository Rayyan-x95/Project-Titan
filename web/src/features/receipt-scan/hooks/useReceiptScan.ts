import { useState } from 'react'
import { runReceiptOcr } from '../services/ocrService'
import { parseReceiptText, type ParsedReceipt } from '../utils/receiptParser'

export function useReceiptScan() {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null)

  async function scanReceipt(file: File) {
    setError('')
    setIsScanning(true)

    try {
      const rawText = await runReceiptOcr(file)
      const parsedReceipt = parseReceiptText(rawText)
      setParsed(parsedReceipt)
      return parsedReceipt
    } catch {
      setError('Receipt scan failed. You can still enter values manually.')
      return null
    } finally {
      setIsScanning(false)
    }
  }

  return {
    isScanning,
    error,
    parsed,
    scanReceipt,
  }
}
