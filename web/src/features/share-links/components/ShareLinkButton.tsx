import { useState } from 'react'

type ShareLinkButtonProps = {
  createLink: () => string
  className?: string
}

export function ShareLinkButton({ createLink, className }: ShareLinkButtonProps) {
  const [feedback, setFeedback] = useState('')

  async function handleClick() {
    const link = createLink()

    try {
      await navigator.clipboard.writeText(link)
      setFeedback('Link copied.')
    } catch {
      setFeedback('Copy failed. You can still share manually.')
    }
  }

  return (
    <div className="share-link-button-wrap">
      <button className={className ?? 'button button-secondary'} onClick={handleClick} type="button">
        Copy share link
      </button>
      {feedback ? <p className="inline-feedback inline-feedback-success">{feedback}</p> : null}
    </div>
  )
}
