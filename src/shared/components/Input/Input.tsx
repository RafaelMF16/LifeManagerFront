import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import Icon from '../Icon/Icon'
import type { IconName } from '../Icon/Icon'
import './Input.css'

type InputSize = 'sm' | 'md' | 'lg'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string
  hint?: string
  error?: string
  icon?: IconName
  prefix?: string
  suffix?: string
  numeric?: boolean
  size?: InputSize
  containerClassName?: string
}

function Input({
  label,
  hint,
  error,
  icon,
  prefix,
  suffix,
  numeric = false,
  size = 'md',
  disabled,
  id,
  className,
  containerClassName,
  ...rest
}: InputProps) {
  const autoId = useId()
  const inputId = id || autoId

  const containerClasses = [
    'lm-input-field',
    `lm-input-field--${size}`,
    error && 'lm-input-field--error',
    disabled && 'lm-input-field--disabled',
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ')

  const inputClasses = ['lm-input-field__input', numeric && 'lm-input-field__input--numeric', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses}>
      {label ? (
        <label htmlFor={inputId} className="lm-input-field__label">
          {label}
        </label>
      ) : null}
      <div className="lm-input-field__control">
        {icon ? <Icon name={icon} size={15} /> : null}
        {prefix ? <span className="lm-input-field__prefix">{prefix}</span> : null}
        <input id={inputId} disabled={disabled} aria-invalid={Boolean(error) || undefined} className={inputClasses} {...rest} />
        {suffix ? <span className="lm-input-field__suffix">{suffix}</span> : null}
      </div>
      {error ? (
        <span className="lm-input-field__error">{error}</span>
      ) : hint ? (
        <span className="lm-input-field__hint">{hint}</span>
      ) : null}
    </div>
  )
}

export default Input
