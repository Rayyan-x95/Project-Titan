import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'

export type TitanDropdownOption = {
  label: string
  value: string
}

type TitanDropdownProps = {
  label: string
  options: TitanDropdownOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function TitanDropdown({
  label,
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select an option',
  className,
}: TitanDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen((current) => !current)
      return
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={rootRef} className={`titan-dropdown ${className ?? ''}`.trim()}>
      <span className="field-label">{label}</span>
      <button
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-haspopup="listbox"
        className="titan-dropdown-trigger"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        type="button"
      >
        <span className={selectedOption ? 'titan-dropdown-value' : 'titan-dropdown-placeholder'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="titan-dropdown-caret" aria-hidden="true">⌄</span>
      </button>

      {isOpen ? (
        <div className="titan-dropdown-menu" role="listbox" aria-label={label}>
          {options.map((option) => {
            const isSelected = option.value === value

            return (
              <button
                key={option.value}
                aria-selected={isSelected ? 'true' : 'false'}
                className={`titan-dropdown-option ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                {isSelected ? <span className="titan-dropdown-check">✓</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}