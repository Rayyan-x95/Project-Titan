import { useRef, type ChangeEvent } from 'react'
import { useReceiptScan } from '../hooks/useReceiptScan'

type ReceiptScanPanelProps = {
  onApply: (values: { amount?: string; merchant?: string; date?: string }) => void
}

export function ReceiptScanPanel({ onApply }: ReceiptScanPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { isScanning, error, parsed, scanReceipt } = useReceiptScan()

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const result = await scanReceipt(file)
    if (!result) {
      return
    }

    onApply({
      amount: result.amountRupees ? result.amountRupees.toFixed(2) : undefined,
      merchant: result.merchant,
      date: result.date,
    })
  }

  return (
    <section className="glass-panel receipt-scan-panel" aria-label="Receipt scanner">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Receipt scan</p>
          <h3>Camera-first OCR import</h3>
        </div>
      </div>

      <input
        ref={inputRef}
        accept="image/*"
        aria-label="Upload a receipt image"
        className="sr-only"
        onChange={handleFileChange}
        title="Upload receipt"
        type="file"
      />

      <div className="button-row">
        <button
          className="button button-secondary"
          onClick={() => inputRef.current?.click()}
          type="button"
          disabled={isScanning}
        >
          {isScanning ? 'Scanning receipt...' : 'Scan receipt'}
        </button>
      </div>

      {error ? <p className="inline-feedback inline-feedback-error">{error}</p> : null}

      {parsed ? (
        <div className="helper-block">
          <p className="eyebrow">OCR preview</p>
          <p className="muted-copy">Merchant: {parsed.merchant || 'N/A'}</p>
          <p className="muted-copy">Amount: {parsed.amountRupees ? parsed.amountRupees.toFixed(2) : 'N/A'}</p>
          <p className="muted-copy">Date: {parsed.date || 'N/A'}</p>
        </div>
      ) : null}
    </section>
  )
}
