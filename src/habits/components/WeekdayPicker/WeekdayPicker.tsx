import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import type { WeekDay } from '../../types/HabitDtos'
import { WEEK_DAYS } from '../../types/HabitDtos'
import { weekDayLabels } from '../../utils/formatFrequency'
import './WeekdayPicker.css'

interface WeekdayPickerProps {
  label: string
  value: readonly WeekDay[]
  /** Receives the picked days Monday first. */
  onChange: (value: WeekDay[]) => void
  /** Already translated. */
  error?: string
}

/** Seven toggle buttons, Monday first, for the days a habit is due on. Any number of days can be on. */
function WeekdayPicker({ label, value, onChange, error }: WeekdayPickerProps) {
  const { i18n } = useTranslation()
  const labelId = useId()
  const errorId = useId()
  const shortLabels = weekDayLabels(i18n.language, 'short')
  const longLabels = weekDayLabels(i18n.language, 'long')

  function toggle(day: WeekDay) {
    const next = value.includes(day) ? value.filter((picked) => picked !== day) : [...value, day]
    onChange(WEEK_DAYS.filter((weekDay) => next.includes(weekDay)))
  }

  return (
    <div className={`lm-weekday-picker${error ? ' lm-weekday-picker--error' : ''}`}>
      <span id={labelId} className="lm-weekday-picker__label">
        {label}
      </span>
      <div
        className="lm-weekday-picker__days"
        role="group"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
      >
        {WEEK_DAYS.map((day) => {
          const picked = value.includes(day)
          return (
            <button
              key={day}
              type="button"
              aria-pressed={picked}
              aria-label={longLabels[day]}
              className={`lm-weekday-picker__day${picked ? ' lm-weekday-picker__day--picked' : ''}`}
              onClick={() => toggle(day)}
            >
              {shortLabels[day]}
            </button>
          )
        })}
      </div>
      {error ? (
        <span id={errorId} className="lm-weekday-picker__error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}

export default WeekdayPicker
