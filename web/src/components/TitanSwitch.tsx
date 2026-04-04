type TitanSwitchProps = {
  label: string
  checked: boolean
  onChange: (nextValue: boolean) => void
  disabled?: boolean
  className?: string
}

export function TitanSwitch({
  label,
  checked,
  onChange,
  disabled = false,
  className,
}: TitanSwitchProps) {
  const stateLabel = checked ? 'On' : 'Off'

  return (
    <div className={`titan-switch-row ${className ?? ''}`.trim()}>
      <span className="field-label">{label}</span>
      <input
        aria-label={`${label}: ${stateLabel}`}
        className={`titan-switch ${checked ? 'checked' : ''}`}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        title={`${label}: ${stateLabel}`}
        type="checkbox"
      />
    </div>
  )
}
