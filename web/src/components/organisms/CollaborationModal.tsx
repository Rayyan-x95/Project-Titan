import type { ReactNode } from 'react'

type CollaborationModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function CollaborationModal({
  isOpen,
  onClose,
  title,
  children,
}: CollaborationModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="collaboration-overlay active">
      <div className="collaboration-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose} type="button">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
