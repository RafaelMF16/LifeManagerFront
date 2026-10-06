import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import type { IconName } from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import Pagination from '../../../shared/components/Pagination/Pagination'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import Select from '../../../shared/components/Select/Select'
import type { PagedResponse, SortDirection } from '../../../shared/types/Paging'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { RecurringTransactionsStatus } from '../../hooks/useRecurringTransactions'
import type {
  RecurringTransactionResponseDto,
  RecurringTransactionSortBy,
  RecurringTransactionStatusFilter,
} from '../../types/RecurringTransactionDtos'
import type { MoneyFlowType, TransactionTypeFilter } from '../../types/TransactionDtos'
import { parseYearMonth } from '../../utils/yearMonth'
import Amount from '../Amount/Amount'
import './RecurringTransactionList.css'

const TYPE_FILTERS: TransactionTypeFilter[] = ['All', 'Income', 'Expense', 'Investment']
const STATUS_FILTERS: RecurringTransactionStatusFilter[] = ['All', 'Active', 'Paused', 'Finished']
const SORT_OPTIONS: RecurringTransactionSortBy[] = ['NextOccurrence', 'Description', 'Amount', 'Day']

// Same reading as the transactions list: money leaving the account (expense, investment) shows negative.
const TYPE_DISPLAY: Record<MoneyFlowType, { icon: IconName; modifier: string; labelKey: string; sign: 1 | -1 }> = {
  Income: { icon: 'arrow-down-left', modifier: 'income', labelKey: 'finance:recurring.list.income', sign: 1 },
  Expense: { icon: 'arrow-up-right', modifier: 'expense', labelKey: 'finance:recurring.list.expense', sign: -1 },
  Investment: { icon: 'piggy-bank', modifier: 'investment', labelKey: 'finance:recurring.list.investment', sign: -1 },
}

interface RecurringTransactionListProps {
  /** The current page from the server; kept while the next one loads. */
  data: PagedResponse<RecurringTransactionResponseDto> | undefined
  status: RecurringTransactionsStatus
  isFetching: boolean
  type: TransactionTypeFilter
  onTypeChange: (type: TransactionTypeFilter) => void
  statusFilter: RecurringTransactionStatusFilter
  onStatusFilterChange: (status: RecurringTransactionStatusFilter) => void
  searchInput: string
  onSearchChange: (value: string) => void
  hasFilters: boolean
  onClearFilters: () => void
  sortBy: RecurringTransactionSortBy
  sortDirection: SortDirection
  onSortByChange: (sortBy: RecurringTransactionSortBy) => void
  onToggleSortDirection: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
  onCreate: () => void
  onEdit: (recurringTransaction: RecurringTransactionResponseDto) => void
  onTogglePause: (recurringTransaction: RecurringTransactionResponseDto) => void
  onDelete: (recurringTransaction: RecurringTransactionResponseDto) => void
  /** The recurrence whose pause/resume is in flight, so its button shows it and can't be pressed twice. */
  pendingId: number | null
}

/** The user's recurring transactions as cards: what, how much, which day, and when it posts next. */
function RecurringTransactionList({
  data,
  status,
  isFetching,
  type,
  onTypeChange,
  statusFilter,
  onStatusFilterChange,
  searchInput,
  onSearchChange,
  hasFilters,
  onClearFilters,
  sortBy,
  sortDirection,
  onSortByChange,
  onToggleSortDirection,
  onPageChange,
  onRetry,
  onCreate,
  onEdit,
  onTogglePause,
  onDelete,
  pendingId,
}: RecurringTransactionListProps) {
  const { t: translate } = useTranslation('finance')
  const { dayLabel, shortMonthName } = useFinanceFormat()

  const sortedLabel = translate(
    sortDirection === 'Asc' ? 'finance:recurring.list.sort.ascending' : 'finance:recurring.list.sort.descending',
  )

  function monthLabel(value: string) {
    const parsed = parseYearMonth(value)
    return parsed ? `${shortMonthName(parsed.month)} ${parsed.year}` : value
  }

  function renderSchedule(item: RecurringTransactionResponseDto) {
    const parts = [translate('finance:recurring.list.everyMonth', { day: item.dayOfMonth })]
    if (item.endMonth) parts.push(translate('finance:recurring.list.until', { month: monthLabel(item.endMonth) }))
    return parts.join(' · ')
  }

  function renderNext(item: RecurringTransactionResponseDto) {
    if (item.status === 'Finished') {
      return <span className="lm-recurring-list__status lm-recurring-list__status--finished">{translate('finance:recurring.list.finished')}</span>
    }
    if (item.status === 'Paused') {
      return <span className="lm-recurring-list__status lm-recurring-list__status--paused">{translate('finance:recurring.list.paused')}</span>
    }
    return (
      <span className="lm-recurring-list__next lm-numeric">
        {translate('finance:recurring.list.next', { date: item.nextOccurrenceDate ? dayLabel(item.nextOccurrenceDate) : '' })}
      </span>
    )
  }

  function renderRows() {
    if (status === 'loading') {
      return <div className="lm-recurring-list__state">{translate('finance:recurring.list.loading')}</div>
    }

    if (status === 'error' || !data) {
      return (
        <div className="lm-recurring-list__state">
          <span>{translate('finance:recurring.list.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {translate('finance:recurring.list.retry')}
          </Button>
        </div>
      )
    }

    if (data.totalCount === 0) {
      return hasFilters ? (
        <div className="lm-recurring-list__state">
          <span>{translate('finance:recurring.list.noResults')}</span>
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            {translate('finance:recurring.list.filters.clearAll')}
          </Button>
        </div>
      ) : (
        <div className="lm-recurring-list__state">
          <span className="lm-recurring-list__state-title">{translate('finance:recurring.list.empty')}</span>
          <span>{translate('finance:recurring.list.emptyHint')}</span>
          <Button variant="secondary" size="sm" icon="plus" onClick={onCreate}>
            {translate('finance:recurring.newButton')}
          </Button>
        </div>
      )
    }

    return data.items.map((item) => {
      const display = TYPE_DISPLAY[item.type]
      const paused = item.status === 'Paused'
      return (
        <div key={item.id} className={`lm-recurring-list__row${item.status !== 'Active' ? ' lm-recurring-list__row--inactive' : ''}`}>
          <div className="lm-recurring-list__main">
            <span className="lm-recurring-list__description">
              <Icon
                name={display.icon}
                size={16}
                className={`lm-recurring-list__type-icon lm-recurring-list__type-icon--${display.modifier}`}
                aria-label={translate(display.labelKey)}
                role="img"
              />
              <span className="lm-recurring-list__description-text">{item.description}</span>
            </span>
            <span className="lm-recurring-list__meta">
              <span className="lm-recurring-list__badge">{item.categoryName}</span>
              <span className="lm-recurring-list__schedule">{renderSchedule(item)}</span>
            </span>
          </div>
          <div className="lm-recurring-list__figures">
            <Amount value={display.sign * item.amount} tone={item.type === 'Investment' ? 'investment' : 'signed'} />
            {renderNext(item)}
          </div>
          <div className="lm-recurring-list__actions">
            <IconButton icon="pencil" size="sm" label={translate('finance:recurring.list.edit')} onClick={() => onEdit(item)} />
            {item.status !== 'Finished' ? (
              <IconButton
                icon={paused ? 'play' : 'pause'}
                size="sm"
                label={translate(paused ? 'finance:recurring.list.resume' : 'finance:recurring.list.pause')}
                disabled={pendingId === item.id}
                onClick={() => onTogglePause(item)}
              />
            ) : null}
            <IconButton icon="trash-2" size="sm" label={translate('finance:recurring.list.delete')} onClick={() => onDelete(item)} />
          </div>
        </div>
      )
    })
  }

  function rangeLabel(page: PagedResponse<RecurringTransactionResponseDto>) {
    if (page.totalCount === 0) return translate('finance:recurring.pagination.none')

    const from = (page.page - 1) * page.pageSize + 1
    return translate('finance:recurring.pagination.range', { from, to: from + page.items.length - 1, count: page.totalCount })
  }

  return (
    <section
      className={`lm-recurring-list${isFetching && status === 'ready' ? ' lm-recurring-list--fetching' : ''}`}
      aria-busy={isFetching}
    >
      <div className="lm-recurring-list__toolbar">
        <div className="lm-recurring-list__heading">
          <h2 className="lm-recurring-list__title">{translate('finance:recurring.list.title')}</h2>
          {status === 'ready' && data ? (
            <span className="lm-recurring-list__count">
              {translate(hasFilters ? 'finance:recurring.list.results' : 'finance:recurring.list.count', { count: data.totalCount })}
            </span>
          ) : null}
        </div>

        <div className="lm-recurring-list__filters">
          <div className="lm-recurring-list__type">
            <span className="lm-recurring-list__filter-label" aria-hidden="true">
              {translate('finance:recurring.list.filters.type')}
            </span>
            <SegmentedControl
              size="md"
              aria-label={translate('finance:recurring.list.filters.type')}
              options={TYPE_FILTERS.map((option) => ({
                value: option,
                label: translate(`finance:recurring.list.filters.typeOptions.${option}`),
              }))}
              value={type}
              onChange={onTypeChange}
              className="lm-recurring-list__type-control"
            />
          </div>
          <Select
            size="sm"
            label={translate('finance:recurring.list.filters.status')}
            options={STATUS_FILTERS.map((option) => ({
              value: option,
              label: translate(`finance:recurring.list.filters.statusOptions.${option}`),
            }))}
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as RecurringTransactionStatusFilter)}
            containerClassName="lm-recurring-list__status-filter"
          />
          <Input
            type="search"
            size="sm"
            icon="search"
            placeholder={translate('finance:recurring.list.filters.searchPlaceholder')}
            aria-label={translate('finance:recurring.list.filters.searchPlaceholder')}
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            containerClassName="lm-recurring-list__search"
          />
          {hasFilters ? (
            <Button variant="ghost" size="sm" icon="x" onClick={onClearFilters} className="lm-recurring-list__clear">
              {translate('finance:recurring.list.filters.clear')}
            </Button>
          ) : null}
        </div>

        <div className="lm-recurring-list__sort">
          <Select
            size="sm"
            label={translate('finance:recurring.list.sort.label')}
            options={SORT_OPTIONS.map((option) => ({
              value: option,
              label: translate(`finance:recurring.list.sort.options.${option}`),
            }))}
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as RecurringTransactionSortBy)}
            containerClassName="lm-recurring-list__sort-select"
          />
          <IconButton
            icon={sortDirection === 'Asc' ? 'arrow-up-narrow-wide' : 'arrow-down-wide-narrow'}
            variant="secondary"
            size="sm"
            label={`${translate('finance:recurring.list.sort.toggleDirection')} (${sortedLabel})`}
            title={sortedLabel}
            onClick={onToggleSortDirection}
          />
        </div>
      </div>

      <div className="lm-recurring-list__rows">{renderRows()}</div>

      {status === 'ready' && data ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={rangeLabel(data)} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

export default RecurringTransactionList
