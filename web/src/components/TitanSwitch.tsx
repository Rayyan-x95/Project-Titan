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
  return (
    <div className={`titan-switch-row ${className ?? ''}`.trim()}>
      <span className="field-label">{label}</span>
      <button
        aria-checked={checked ? 'true' : 'false'}
        className={`titan-switch ${checked ? 'checked' : ''}`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      >
        <span className="titan-switch-thumb" aria-hidden="true" />
      </button>
    </div>
  )
}
