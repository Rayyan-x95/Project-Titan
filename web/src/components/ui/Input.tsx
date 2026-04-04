interface InputProps {
  type?: string
  placeholder?: string
  label?: string
  required?: boolean
  fullWidth?: boolean
  error?: string | null
  icon?: React.ReactNode
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  label,
  required = false,
  fullWidth = false,
  error = null,
  icon,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className={`input-wrapper ${fullWidth ? 'full-width' : ''}`}>
      <label
        className={`input-label ${error ? 'error' : ''}`}
        htmlFor={label}
      >
        {label}
        {icon && <span className="input-icon">{icon}</span>}
      </label>
      <div className="input-group">
        <input
          id={label}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="input"
          aria-invalid={!!error}
          aria-describedby={error ? 'error-id' : undefined}
        />
        {error && (
          <span id="error-id" className="input-error">
            {error}
          </span>
        )}
      </div>
    </div>
  )
}

export default Input
