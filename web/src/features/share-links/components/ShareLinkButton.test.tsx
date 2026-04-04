import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ShareLinkButton } from './ShareLinkButton'

describe('ShareLinkButton', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('copies the generated link and announces success', async () => {
    const user = userEvent.setup()

    render(<ShareLinkButton createLink={() => 'https://example.com/share'} />)

    await user.click(screen.getByRole('button', { name: 'Copy share link' }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/share')
    expect(screen.getByRole('status')).toHaveTextContent('Link copied.')
  })
})