interface CollaborationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const CollaborationModal: React.FC<CollaborationModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className={`collaboration-overlay ${isOpen ? 'active' : ''}`}>
      <div className="collaboration-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export { CollaborationModal }
