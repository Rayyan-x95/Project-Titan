import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TitanDropdown } from './TitanDropdown'

describe('TitanDropdown', () => {
  it('supports keyboard selection and closes after commit', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <TitanDropdown
        label="Currency"
        options={[
          { label: 'USD', value: 'USD' },
          { label: 'INR', value: 'INR' },
        ]}
        value="USD"
        onChange={onChange}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Currency: USD' })
    await user.click(trigger)

    const listbox = screen.getByRole('listbox')
    fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    fireEvent.keyDown(listbox, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith('INR')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})