interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset' | 'secondary'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  fullWidth = false,
  icon,
}) => {
  const getButtonStyles = (selected: boolean) => {
    if (disabled) {
      return {
        background: selected ? '#1abc9c' : '#3498db',
        border: selected ? '2px solid #1abc9c' : '2px solid #3498db',
        borderRadius: '0',
      }
    }

    return {
      background: variant === 'primary' ? '#1abc9c' : '#3498db',
      border: 'none',
      borderRadius: '0',
    }
  }

  const getButtonClasses = () => ({
    width: fullWidth ? '100%' : 'auto',
    ...getButtonStyles(selected: false),
    ...getButtonStyles(selected: true),
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    transition: 'all 0.2s',
    ...className
  })

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  )
}

export default Button
