import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Icon from '../Icon/Icon'
import type { IconName } from '../Icon/Icon'
import './Button.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: IconName | ReactNode
  iconRight?: IconName | ReactNode
  loading?: boolean
  fullWidth?: boolean
}

function renderIcon(icon: IconName | ReactNode | undefined) {
  if (!icon) return null
  return typeof icon === 'string' ? <Icon name={icon as IconName} /> : icon
}

function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  type = 'button',
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const off = disabled || loading
  const classes = [
    'lm-button',
    `lm-button--${variant}`,
    `lm-button--${size}`,
    fullWidth && 'lm-button--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} disabled={off} aria-busy={loading || undefined} className={classes} {...rest}>
      {loading ? <span aria-hidden="true" className="lm-button__spinner" /> : renderIcon(icon)}
      {children}
      {!loading && renderIcon(iconRight)}
    </button>
  )
}

export default Button
