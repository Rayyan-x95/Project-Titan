import { useId } from 'react'

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

  return (
    <div className={`titan-segmented ${className ?? ''}`.trim()}>
      <span className="field-label" id={labelId}>
        {label}
      </span>
      <div className="titan-segmented-group" role="radiogroup" aria-labelledby={labelId}>
        {options.map((option) => {
          const isActive = option.value === value

          return (
            <button
              key={option.value}
              aria-checked={isActive ? 'true' : 'false'}
              className={`titan-segmented-button ${isActive ? 'active' : ''}`}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              role="radio"
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
