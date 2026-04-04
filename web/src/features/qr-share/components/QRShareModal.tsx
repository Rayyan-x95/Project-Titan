import { downloadImageFromUrl } from '../utils/qr'

type QRShareModalProps = {
  open: boolean
  title: string
  subtitle?: string
  scanValue: string
  imageUrl: string
  onClose: () => void
}

export function QRShareModal({
  open,
  title,
  subtitle,
  scanValue,
  imageUrl,
  onClose,
}: QRShareModalProps) {
  if (!open) {
    return null
  }

  async function handleNativeShare() {
    if (!navigator.share) {
      return
    }

    try {
      await navigator.share({ title, text: subtitle ?? title, url: scanValue })
    } catch {
      // Ignore user-cancelled native share actions.
    }
  }

  return (
    <div className="overlay-modal" role="dialog" aria-modal="true" aria-label={title}>
      <article className="glass-panel modal-card">
        <p className="eyebrow">Scan to view</p>
        <h3>{title}</h3>
        {subtitle ? <p className="muted-copy">{subtitle}</p> : null}
        <img alt="Scan to view shared Titan result" className="qr-preview" src={imageUrl} loading="lazy" />

        <div className="button-row">
          <button
            className="button button-secondary"
            onClick={() => {
              void downloadImageFromUrl(imageUrl, 'titan-qr.png')
            }}
            type="button"
          >
            Download QR
          </button>
          <button className="button button-secondary" onClick={handleNativeShare} type="button">
            Share
          </button>
          <button className="button button-primary" onClick={onClose} type="button">
            Done
          </button>
        </div>
      </article>
    </div>
  )
}
