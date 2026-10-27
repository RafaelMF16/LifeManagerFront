import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import IconButton from '../../../shared/components/IconButton/IconButton'
import { useDashboardDays } from '../../hooks/useDashboardDays'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { DashboardDayDto } from '../../types/DashboardDtos'
import { calendarGrid } from '../../utils/calendarGrid'
import { parseYearMonth, toIsoDate } from '../../utils/yearMonth'
import Amount from '../Amount/Amount'
import './DailySpendingCalendar.css'

interface DailySpendingCalendarProps {
  /** The dashboard period's months, `yyyy-MM`, oldest first. Key the component by period to start over. */
  months: string[]
}

/** The month's expenses day by day, starting on the period's newest month. */
function DailySpendingCalendar({ months }: DailySpendingCalendarProps) {
  const { t: translate } = useTranslation('finance')
  const { money, compactMoney, periodLabel, weekdayNames } = useFinanceFormat()
  const titleId = useId()
  const { month, data, status, isFetching, reload, previousMonth, nextMonth, setMonth } = useDashboardDays(months)

  const parsedMonth = parseYearMonth(month)
  const today = toIsoDate(new Date())
  const showsNavigation = months.length > 1
  // While the next month loads, the previous one's days stay on screen, dimmed.
  const daysByDate = new Map<string, DashboardDayDto>((data?.days ?? []).map((day) => [day.date, day]))
  const weeks = data ? calendarGrid(data.month) : []
  const shortNames = weekdayNames('short')
  const narrowNames = weekdayNames('narrow')

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
        <div className="lm-daily-calendar__summary">
          {data.total > 0 ? (
            <>
              <span className="lm-daily-calendar__summary-label">{translate('finance:dashboard.days.monthTotal')}</span>
              <Amount value={data.total} tone="negative" emphasis />
            </>
          ) : (
            <span className="lm-daily-calendar__summary-label">{translate('finance:dashboard.days.empty')}</span>
          )}
        </div>

        <div className="lm-daily-calendar__grid">
          {shortNames.map((name, index) => (
            <span key={index} className="lm-daily-calendar__weekday" aria-hidden="true">
              <span className="lm-daily-calendar__wide">{name}</span>
              <span className="lm-daily-calendar__compact">{narrowNames[index]}</span>
            </span>
          ))}
          {weeks.flat().map((date, index) => {
            if (date === null) return <span key={`blank-${index}`} className="lm-daily-calendar__blank" aria-hidden="true" />

            const day = daysByDate.get(date)
            const total = day?.total ?? 0
            const isFuture = date > today
            const classes = [
              'lm-daily-calendar__day',
              date === today && 'lm-daily-calendar__day--today',
              isFuture && 'lm-daily-calendar__day--future',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <div key={date} className={classes}>
                <span className="lm-daily-calendar__day-number">{Number(date.slice(8))}</span>
                {total > 0 ? (
                  <span className="lm-daily-calendar__day-total lm-numeric">
                    <span className="lm-daily-calendar__wide">{money(total)}</span>
                    <span className="lm-daily-calendar__compact">{compactMoney(total)}</span>
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <section className="lm-daily-calendar" aria-labelledby={titleId}>
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
