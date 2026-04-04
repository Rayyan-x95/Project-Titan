import { useEffect, useRef } from 'react'
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
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector)
      if (!focusable || focusable.length === 0) {
        return
      }

      const firstFocusable = focusable[0]
      const lastFocusable = focusable[focusable.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      } else if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

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
    <div className="overlay-modal" role="presentation" onClick={onClose}>
      <article
        className="glass-panel modal-card"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
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
          <button className="button button-primary" onClick={onClose} ref={closeButtonRef} type="button">
            Done
          </button>
        </div>
      </article>
    </div>
  )
}
