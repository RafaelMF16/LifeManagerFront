import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import Pagination from '../../../shared/components/Pagination/Pagination'
import type { PagedResponse } from '../../../shared/types/Paging'
import { useDayExpenses } from '../../hooks/useDayExpenses'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { DashboardDayDto, DashboardDaysResponseDto } from '../../types/DashboardDtos'
import type { TransactionResponseDto } from '../../types/TransactionDtos'
import Amount from '../Amount/Amount'
import './DayExpensesPanel.css'

interface DayExpensesPanelProps {
  days: DashboardDaysResponseDto
  /** ISO `YYYY-MM-DD`; null shows the month's summary and a hint. */
  selectedDate: string | null
}

/** Beside the calendar (below it on compact screens): the selected day's expenses, or the month at a glance. */
function DayExpensesPanel({ days, selectedDate }: DayExpensesPanelProps) {
  const { t: translate } = useTranslation('finance')
  const { dayLabel, fullDayLabel } = useFinanceFormat()
  const day = selectedDate ? days.days.find((item) => item.date === selectedDate) : undefined

  if (!day) {
    const biggest = days.total > 0 ? days.days.reduce((max, item) => (item.total > max.total ? item : max)) : null

    return (
      <div className="lm-day-panel" aria-live="polite">
        {biggest ? (
          <>
            <div className="lm-day-panel__heading">
              <span className="lm-day-panel__label">{translate('finance:dashboard.days.monthTotal')}</span>
              <Amount value={days.total} tone="negative" emphasis />
            </div>
            <div className="lm-day-panel__biggest">
              <span>{translate('finance:dashboard.days.biggestDay', { day: dayLabel(biggest.date) })}</span>
              <Amount value={biggest.total} tone="negative" />
            </div>
            <p className="lm-day-panel__hint">{translate('finance:dashboard.days.hint')}</p>
          </>
        ) : (
          <p className="lm-day-panel__hint">{translate('finance:dashboard.days.empty')}</p>
        )}
      </div>
    )
  }

  return (
    <div className="lm-day-panel" aria-live="polite">
      <div className="lm-day-panel__heading">
        <span className="lm-day-panel__date">{fullDayLabel(day.date)}</span>
        {day.count > 0 ? (
          <span className="lm-day-panel__figures">
            <Amount value={day.total} tone="negative" emphasis />
            <span className="lm-day-panel__count">
              {translate('finance:dashboard.days.expenseCount', { count: day.count })}
            </span>
          </span>
        ) : null}
      </div>

      {day.count > 0 && days.monthlySummaryId !== null ? (
        <DayExpensesList key={day.date} monthlySummaryId={days.monthlySummaryId} day={day} />
      ) : (
        <p className="lm-day-panel__hint">{translate('finance:dashboard.days.dayEmpty')}</p>
      )}
    </div>
  )
}

interface DayExpensesListProps {
  monthlySummaryId: number
  day: DashboardDayDto
}

function DayExpensesList({ monthlySummaryId, day }: DayExpensesListProps) {
  const { t: translate } = useTranslation('finance')
  const { data, status, isFetching, setPage, reload } = useDayExpenses(monthlySummaryId, day.date)

  function rangeLabel(page: PagedResponse<TransactionResponseDto>) {
    const from = (page.page - 1) * page.pageSize + 1
    return translate('finance:transactions.pagination.range', {
      from,
      to: from + page.items.length - 1,
      count: page.totalCount,
    })
  }

  if (status === 'error') {
    return (
      <div className="lm-day-panel__state">
        <span>{translate('finance:dashboard.days.listLoadError')}</span>
        <Button variant="secondary" size="sm" onClick={reload}>
          {translate('finance:dashboard.retry')}
        </Button>
      </div>
    )
  }

  if (!data) {
    return <div className="lm-day-panel__state">{translate('finance:dashboard.days.listLoading')}</div>
  }

  return (
    <>
      <ul
        className={`lm-day-panel__list${isFetching ? ' lm-day-panel__list--fetching' : ''}`}
        aria-busy={isFetching}
      >
        {data.items.map((transaction) => (
          <li key={transaction.id} className="lm-day-panel__item">
            <span className="lm-day-panel__description">
              <span className="lm-day-panel__description-text">{transaction.description}</span>
              {transaction.recurringTransactionId !== null ? (
                <Icon
                  name="repeat"
                  size={12}
                  className="lm-day-panel__recurring"
                  aria-label={translate('finance:transactions.list.recurring')}
                  role="img"
                />
              ) : null}
            </span>
            <span className="lm-day-panel__category">{transaction.categoryName}</span>
            <span className="lm-day-panel__amount">
              <Amount value={transaction.amount} tone="negative" />
            </span>
          </li>
        ))}
      </ul>

      {data.totalPages > 1 ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={rangeLabel(data)} onPageChange={setPage} />
      ) : null}

      <Link to={`/finance/months/${monthlySummaryId}`} className="lm-day-panel__link">
        {translate('finance:dashboard.days.seeMonth')}
        <Icon name="chevron-right" size={14} />
      </Link>
    </>
  )
}

export default DayExpensesPanel
