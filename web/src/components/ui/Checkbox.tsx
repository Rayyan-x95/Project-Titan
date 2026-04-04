interface CheckboxProps {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  id?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'medium',
  id,
}) => {
  const baseStyles = 'checkbox'
  const sizeStyles = {
    small: 'size-small',
    medium: 'size-medium',
    large: 'size-large',
  }

  return (
    <label
      className={`checkbox-group ${sizeStyles[size]}`}
      id={id}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        id={label}
      />
      <span className={`checkbox-mark ${checked ? 'checked' : ''}`}>
        <span className="mark"></span>
      </span>
      <span className="checkbox-text">{label}</span>
    </label>
  )
}

export default Checkbox
