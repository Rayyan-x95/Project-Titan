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
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  const selectedIndex = options.findIndex((option) => option.value === value)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const indexToFocus = highlightedIndex >= 0 ? highlightedIndex : Math.max(selectedIndex, 0)
    setHighlightedIndex(indexToFocus)
    optionRefs.current[indexToFocus]?.focus()
  }, [highlightedIndex, isOpen, selectedIndex])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(true)
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)
      return
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  function handleListboxKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!isOpen || options.length === 0) {
      return
    }

    const lastIndex = options.length - 1

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = highlightedIndex >= lastIndex ? 0 : highlightedIndex + 1
      setHighlightedIndex(nextIndex)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = highlightedIndex <= 0 ? lastIndex : highlightedIndex - 1
      setHighlightedIndex(nextIndex)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setHighlightedIndex(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setHighlightedIndex(lastIndex)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const highlightedOption = options[highlightedIndex]
      if (!highlightedOption) {
        return
      }

      onChange(highlightedOption.value)
      setIsOpen(false)
      triggerRef.current?.focus()
      return
    }

    if (event.key === 'Escape' || event.key === 'Tab') {
      setIsOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div ref={rootRef} className={`titan-dropdown ${className ?? ''}`.trim()}>
      <span className="field-label">{label}</span>
      <button
        aria-haspopup="listbox"
        className="titan-dropdown-trigger"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        ref={triggerRef}
        type="button"
      >
        <span className={selectedOption ? 'titan-dropdown-value' : 'titan-dropdown-placeholder'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="titan-dropdown-caret" aria-hidden="true">⌄</span>
      </button>

      {isOpen ? (
        <div className="titan-dropdown-menu" onKeyDown={handleListboxKeyDown} role="listbox" aria-label={label}>
          {options.map((option) => {
            const isSelected = option.value === value
            const optionIndex = options.findIndex((item) => item.value === option.value)
            const isHighlighted = optionIndex === highlightedIndex

            return (
              <button
                key={option.value}
                className={`titan-dropdown-option ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                  triggerRef.current?.focus()
                }}
                ref={(element) => {
                  optionRefs.current[optionIndex] = element
                }}
                role="option"
                tabIndex={isHighlighted ? 0 : -1}
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