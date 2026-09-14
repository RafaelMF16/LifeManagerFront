import type { ReactNode } from 'react'
import './SegmentedControl.css'

interface SegmentedControlOption<TValue extends string> {
  value: TValue
  label: ReactNode
  srLabel?: string
}

interface SegmentedControlProps<TValue extends string> {
  options: SegmentedControlOption<TValue>[]
  value: TValue
  onChange: (value: TValue) => void
  'aria-label': string
}

function SegmentedControl<TValue extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<TValue>) {
  return (
    <div className="lm-segmented-control" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          aria-label={option.srLabel}
          className={`lm-segmented-control__option${option.value === value ? ' lm-segmented-control__option--active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentedControl
