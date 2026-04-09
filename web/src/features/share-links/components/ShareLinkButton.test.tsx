import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ShareLinkButton } from './ShareLinkButton'

describe('ShareLinkButton', () => {
  it('copies the generated link and announces success', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    render(<ShareLinkButton createLink={() => 'https://example.com/share'} />)

    await user.click(screen.getByRole('button', { name: 'Copy share link' }))

    expect(writeText).toHaveBeenCalledWith('https://example.com/share')
    expect(screen.getByRole('status')).toHaveTextContent('Link copied.')
  })
})
