import { useId } from 'react'

type CheckboxProps = {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  id?: string
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'medium',
  id,
}: CheckboxProps) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId

  const sizeStyles = {
    small: 'size-small',
    medium: 'size-medium',
    large: 'size-large',
  }

  return (
    <label className={`checkbox-group ${sizeStyles[size]}`} htmlFor={checkboxId}>
      <input
        checked={checked}
        disabled={disabled}
        id={checkboxId}
        onChange={onChange}
        type="checkbox"
      />
      <span className={`checkbox-mark ${checked ? 'checked' : ''}`}>
        <span className="mark" />
      </span>
      <span className="checkbox-text">{label}</span>
    </label>
  )
}

export default Checkbox
