import { useId, useRef } from 'react'

export type TitanSegmentOption = {
  label: string
  value: string
}

type TitanSegmentedControlProps = {
  label: string
  options: TitanSegmentOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function TitanSegmentedControl({
  label,
  options,
  value,
  onChange,
  disabled = false,
  className,
}: TitanSegmentedControlProps) {
  const labelId = useId()
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (disabled) {
      return
    }

    const lastIndex = options.length - 1
    let nextIndex = index

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      nextIndex = index === lastIndex ? 0 : index + 1
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      nextIndex = index === 0 ? lastIndex : index - 1
    } else if (event.key === 'Home') {
      event.preventDefault()
      nextIndex = 0
    } else if (event.key === 'End') {
      event.preventDefault()
      nextIndex = lastIndex
    } else {
      return
    }

    const nextOption = options[nextIndex]
    if (!nextOption) {
      return
    }

    onChange(nextOption.value)
    buttonRefs.current[nextIndex]?.focus()
  }

  return (
    <div className={`titan-segmented ${className ?? ''}`.trim()}>
      <span className="field-label" id={labelId}>
        {label}
      </span>
      <div className="titan-segmented-group" aria-labelledby={labelId}>
        {options.map((option) => {
          const isActive = option.value === value
          const optionIndex = options.findIndex((item) => item.value === option.value)

          return (
            <button
              key={option.value}
              className={`titan-segmented-button ${isActive ? 'active' : ''}`}
              disabled={disabled}
              onKeyDown={(event) => handleKeyDown(event, optionIndex)}
              onClick={() => onChange(option.value)}
              ref={(element) => {
                buttonRefs.current[optionIndex] = element
              }}
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
