import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QRShareModal } from './QRShareModal'

vi.mock('../utils/qr', () => ({
  downloadImageFromUrl: vi.fn(),
}))

describe('QRShareModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('focuses the primary action and closes on escape and backdrop click', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <QRShareModal
        open
        title="Settlement summary"
        subtitle="Scan to view this settlement"
        scanValue="https://example.com/share"
        imageUrl="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22/%3E"
        onClose={onClose}
      />,
    )

    expect(screen.getByRole('button', { name: 'Done' })).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    const overlay = screen.getByRole('dialog').parentElement
    if (!overlay) {
      throw new Error('Overlay not found')
    }

    await user.click(overlay)
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})