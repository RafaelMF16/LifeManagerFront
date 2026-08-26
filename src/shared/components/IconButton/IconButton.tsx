import type { ButtonHTMLAttributes } from 'react'
import Icon from '../Icon/Icon'
import type { IconName } from '../Icon/Icon'
import './IconButton.css'

type IconButtonVariant = 'ghost' | 'secondary'
type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  icon: IconName
  label: string
  variant?: IconButtonVariant
  size?: IconButtonSize
}

const ICON_SIZE: Record<IconButtonSize, number> = { sm: 14, md: 16, lg: 16 }

function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  const classes = ['lm-icon-button', `lm-icon-button--${variant}`, `lm-icon-button--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} aria-label={label} title={label} className={classes} {...rest}>
      <Icon name={icon} size={ICON_SIZE[size]} />
    </button>
  )
}

export default IconButton
