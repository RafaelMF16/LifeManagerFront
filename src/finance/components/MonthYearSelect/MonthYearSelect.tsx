import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import Select from '../../../shared/components/Select/Select'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { formatYearMonth, parseYearMonth } from '../../utils/yearMonth'
import './MonthYearSelect.css'

/** How many years the year select offers after the first one. */
const YEARS_AHEAD = 10

interface MonthYearSelectProps {
  label: string
  /** `yyyy-MM`, or `''` when `emptyLabel` is given and no month is chosen. */
  value: string
  onChange: (value: string) => void
  /** The first year offered. */
  firstYear: number
  /** Offers "no month" as the month select's first option, with this label (e.g. "No end date"). */
  emptyLabel?: string
  hint?: string
  error?: string
  disabled?: boolean
}

/**
 * Picks a month as two native selects (month, year): `input type="month"` isn't supported by every desktop browser,
 * and selects get the platform's own picker on phones.
 */
function MonthYearSelect({ label, value, onChange, firstYear, emptyLabel, hint, error, disabled }: MonthYearSelectProps) {
  const { t: translate } = useTranslation('finance')
  const { monthName } = useFinanceFormat()
  const labelId = useId()
  const messageId = useId()
  const parsed = parseYearMonth(value)

  const years = Array.from({ length: YEARS_AHEAD + 1 }, (_, index) => firstYear + index)
  // A stored value from before `firstYear` (e.g. an old start month) stays selectable.
  if (parsed && parsed.year < firstYear) years.unshift(parsed.year)

  const monthOptions = [
    ...(emptyLabel !== undefined ? [{ value: '', label: emptyLabel }] : []),
    ...Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1), label: monthName(index + 1) })),
  ]
  const yearOptions = years.map((year) => ({ value: String(year), label: String(year) }))

  function changeMonth(month: string) {
    if (month === '') return onChange('')
    onChange(formatYearMonth(parsed?.year ?? firstYear, Number(month)))
  }

  function changeYear(year: string) {
    onChange(formatYearMonth(Number(year), parsed?.month ?? 1))
  }

  const message = error ?? hint

  return (
    <div
      className={`lm-month-year-select${error ? ' lm-month-year-select--error' : ''}`}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={message ? messageId : undefined}
    >
      <span id={labelId} className="lm-month-year-select__label">
        {label}
      </span>
      <div className="lm-month-year-select__controls">
        <Select
          aria-label={`${label}: ${translate('finance:monthYear.month')}`}
          options={monthOptions}
          value={parsed ? String(parsed.month) : ''}
          onChange={(event) => changeMonth(event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          containerClassName="lm-month-year-select__month"
        />
        <Select
          aria-label={`${label}: ${translate('finance:monthYear.year')}`}
          options={yearOptions}
          value={String(parsed?.year ?? firstYear)}
          onChange={(event) => changeYear(event.target.value)}
          disabled={disabled || !parsed}
          aria-invalid={Boolean(error) || undefined}
          containerClassName="lm-month-year-select__year"
        />
      </div>
      {message ? (
        <span id={messageId} className={error ? 'lm-month-year-select__error' : 'lm-month-year-select__hint'} role={error ? 'alert' : undefined}>
          {message}
        </span>
      ) : null}
    </div>
  )
}

export default MonthYearSelect
