import { useId } from 'react'
import type { Ref, SelectHTMLAttributes } from 'react'
import Icon from '../Icon/Icon'
import './Select.css'

type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[]
  label?: string
  hint?: string
  error?: string
  size?: SelectSize
  containerClassName?: string
  ref?: Ref<HTMLSelectElement>
}

/** Native select styled like `Input`: same label, hint, error and control heights. */
function Select({
  options,
  label,
  hint,
  error,
  size = 'md',
  disabled,
  id,
  className,
  containerClassName,
  ...rest
}: SelectProps) {
  const autoId = useId()
  const selectId = id || autoId

  const containerClasses = [
    'lm-select-field',
    `lm-select-field--${size}`,
    error && 'lm-select-field--error',
    disabled && 'lm-select-field--disabled',
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses}>
      {label ? (
        <label htmlFor={selectId} className="lm-select-field__label">
          {label}
        </label>
      ) : null}
      <div className="lm-select-field__control">
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          className={['lm-select-field__select', className].filter(Boolean).join(' ')}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={14} className="lm-select-field__chevron" aria-hidden="true" />
      </div>
      {error ? (
        <span className="lm-select-field__error">{error}</span>
      ) : hint ? (
        <span className="lm-select-field__hint">{hint}</span>
      ) : null}
    </div>
  )
}

export default Select
