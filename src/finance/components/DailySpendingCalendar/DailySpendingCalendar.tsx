import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import IconButton from '../../../shared/components/IconButton/IconButton'
import { useDashboardDays } from '../../hooks/useDashboardDays'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'
import type { DashboardDayDto } from '../../types/DashboardDtos'
import { calendarGrid, calendarKeyTarget } from '../../utils/calendarGrid'
import { dayHeatLevel } from '../../utils/dayHeatLevel'
import { parseYearMonth, toIsoDate, toYearMonth } from '../../utils/yearMonth'
import DayExpensesPanel from '../DayExpensesPanel/DayExpensesPanel'
import './DailySpendingCalendar.css'

/** The legend's swatches, from no spending to the month's biggest days. */
const LEGEND_LEVELS = [0, 1, 2, 3, 4] as const

interface DailySpendingCalendarProps {
  /** The dashboard period's months, `yyyy-MM`, oldest first. Key the component by period to start over. */
  months: string[]
}

/** The day picked in a month; it only counts while that month is on screen. */
interface DaySelection {
  month: string
  date: string
}

/** A month starts with nothing selected, except the current one, which opens on today. */
function selectedDateOf(selection: DaySelection | null, month: string, now: Date) {
  if (selection?.month === month) return selection.date
  if (month === toYearMonth(now)) return toIsoDate(now)
  return null
}

/** The month's expenses day by day, starting on the period's newest month; a tapped day lists its expenses. */
function DailySpendingCalendar({ months }: DailySpendingCalendarProps) {
  const { t: translate } = useTranslation('finance')
  const { money, compactMoney, fullDayLabel, periodLabel, weekdayNames } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const titleId = useId()
  const { month, data, status, isFetching, reload, previousMonth, nextMonth, setMonth } = useDashboardDays(months)

  const [selection, setSelection] = useState<DaySelection | null>(null)
  const [focusedDate, setFocusedDate] = useState<string | null>(null)
  const dayRefs = useRef(new Map<string, HTMLButtonElement>())

  const parsedMonth = parseYearMonth(month)
  const now = new Date()
  const today = toIsoDate(now)
  const selectedDate = selectedDateOf(selection, month, now)
  const showsNavigation = months.length > 1
  // While the next month loads, the previous one's days stay on screen, dimmed.
  const daysByDate = new Map<string, DashboardDayDto>((data?.days ?? []).map((day) => [day.date, day]))
  const weeks = data ? calendarGrid(data.month) : []
  const longNames = weekdayNames('long')
  const shortNames = weekdayNames('short')
  const narrowNames = weekdayNames('narrow')

  // Roving focus: one day is in the tab order (the focused one, else the selected one, else the month's first
  // day), and the arrow keys move between days.
  const firstPickable = weeks.flat().find((date): date is string => date !== null && date <= today) ?? null
  const isPickable = (date: string | null) => date !== null && date.startsWith(`${data?.month}-`) && date <= today
  const tabbableDate = [focusedDate, selectedDate].find(isPickable) ?? firstPickable

  function handleDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    const target = calendarKeyTarget(weeks, date, event.key, today)
    if (target === null) return

    event.preventDefault()
    setFocusedDate(target)
    dayRefs.current.get(target)?.focus()
  }

  function dayAriaLabel(date: string, day: DashboardDayDto | undefined) {
    if (!day || day.count === 0) return translate('finance:dashboard.days.dayAriaEmpty', { day: fullDayLabel(date) })

    return translate('finance:dashboard.days.dayAria', {
      day: fullDayLabel(date),
      amount: hidden ? translate('finance:privacy.hiddenValue') : money(day.total),
      count: day.count,
    })
  }

  function renderBody() {
    if (status === 'error') {
      return (
        <div className="lm-daily-calendar__state">
          <span>{translate('finance:dashboard.days.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={reload}>
            {translate('finance:dashboard.retry')}
          </Button>
        </div>
      )
    }

    if (!data) {
      return <div className="lm-daily-calendar__state">{translate('finance:dashboard.days.loading')}</div>
    }

    return (
      <div
        className={`lm-daily-calendar__body${isFetching ? ' lm-daily-calendar__body--fetching' : ''}`}
        aria-busy={isFetching}
      >
        <div className="lm-daily-calendar__calendar">
          <div className="lm-daily-calendar__grid" role="grid" aria-labelledby={titleId}>
            <div className="lm-daily-calendar__row" role="row">
              {shortNames.map((name, index) => (
                <span key={index} className="lm-daily-calendar__weekday" role="columnheader" aria-label={longNames[index]}>
                  <span className="lm-daily-calendar__wide" aria-hidden="true">{name}</span>
                  <span className="lm-daily-calendar__compact" aria-hidden="true">{narrowNames[index]}</span>
                </span>
              ))}
            </div>
            {weeks.map((week) => (
              <div key={week.find((date) => date !== null)} className="lm-daily-calendar__row" role="row">
                {week.map((date, index) => {
                  if (date === null) return <span key={`blank-${index}`} className="lm-daily-calendar__blank" role="gridcell" />

                  const day = daysByDate.get(date)
                  const total = day?.total ?? 0
                  const isFuture = date > today
                  // In privacy mode every day looks the same: how strong a color is gives the amount away.
                  const level = hidden ? 0 : dayHeatLevel(total, data.maxDayTotal)
                  const classes = [
                    'lm-daily-calendar__day',
                    `lm-daily-calendar__day--heat-${level}`,
                    date === today && 'lm-daily-calendar__day--today',
                    date === selectedDate && 'lm-daily-calendar__day--selected',
                    isFuture && 'lm-daily-calendar__day--future',
                  ]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <span key={date} className="lm-daily-calendar__cell" role="gridcell">
                      <button
                        ref={(element) => {
                          if (element) dayRefs.current.set(date, element)
                          else dayRefs.current.delete(date)
                        }}
                        type="button"
                        className={classes}
                        disabled={isFuture}
                        tabIndex={date === tabbableDate ? 0 : -1}
                        aria-pressed={date === selectedDate}
                        aria-current={date === today ? 'date' : undefined}
                        aria-label={dayAriaLabel(date, day)}
                        onClick={() => setSelection({ month, date })}
                        onFocus={() => setFocusedDate(date)}
                        onKeyDown={(event) => handleDayKeyDown(event, date)}
                      >
                        <span className="lm-daily-calendar__day-number" aria-hidden="true">
                          {Number(date.slice(8))}
                        </span>
                        {total > 0 ? (
                          <span className="lm-daily-calendar__day-total lm-numeric" aria-hidden="true">
                            <span className="lm-daily-calendar__total-full">{money(total)}</span>
                            <span className="lm-daily-calendar__total-compact">{compactMoney(total)}</span>
                          </span>
                        ) : null}
                      </button>
                    </span>
                  )
                })}
              </div>
            ))}
          </div>

          {!hidden && data.total > 0 ? (
            <div className="lm-daily-calendar__legend" aria-hidden="true">
              <span>{translate('finance:dashboard.days.legendLess')}</span>
              {LEGEND_LEVELS.map((level) => (
                <span key={level} className={`lm-daily-calendar__swatch lm-daily-calendar__day--heat-${level}`} />
              ))}
              <span>{translate('finance:dashboard.days.legendMore')}</span>
            </div>
          ) : null}
        </div>

        <DayExpensesPanel days={data} selectedDate={data.month === month ? selectedDate : null} />
      </div>
    )
  }

  return (
    <section className="lm-daily-calendar" aria-labelledby={titleId} data-tour="dashboard.days">
      <div className="lm-daily-calendar__header">
        <h2 id={titleId} className="lm-daily-calendar__title">
          {translate('finance:dashboard.days.title')}
        </h2>
        <div className="lm-daily-calendar__navigation">
          {showsNavigation ? (
            <IconButton
              icon="chevron-left"
              variant="secondary"
              size="sm"
              label={translate('finance:dashboard.days.previousMonth')}
              disabled={previousMonth === null}
              onClick={() => previousMonth && setMonth(previousMonth)}
            />
          ) : null}
          <span className="lm-daily-calendar__month" aria-live="polite">
            {parsedMonth ? periodLabel(parsedMonth.month, parsedMonth.year) : month}
          </span>
          {showsNavigation ? (
            <IconButton
              icon="chevron-right"
              variant="secondary"
              size="sm"
              label={translate('finance:dashboard.days.nextMonth')}
              disabled={nextMonth === null}
              onClick={() => nextMonth && setMonth(nextMonth)}
            />
          ) : null}
        </div>
      </div>

      {renderBody()}
    </section>
  )
}

export default DailySpendingCalendar
