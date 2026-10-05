import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Pagination from '../../../shared/components/Pagination/Pagination'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import Select from '../../../shared/components/Select/Select'
import type { PagedResponse, SortDirection } from '../../../shared/types/Paging'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { MonthlySummariesStatus } from '../../hooks/useMonthlySummaries'
import type { BalanceFilter, MonthlySummaryResponseDto, MonthlySummarySortBy } from '../../types/MonthlySummaryDtos'
import Amount from '../Amount/Amount'
import './MonthlySummaryList.css'

const ALL_YEARS = 'all'
const BALANCE_FILTERS: BalanceFilter[] = ['All', 'Positive', 'Negative']

// `id` doubles as an i18next key lookup (`finance:months.list.columns.${id}`).
const COLUMNS: { id: MonthlySummarySortBy; numeric: boolean }[] = [
  { id: 'Period', numeric: false },
  { id: 'TotalIncome', numeric: true },
  { id: 'TotalExpense', numeric: true },
  { id: 'TotalInvestment', numeric: true },
  { id: 'Balance', numeric: true },
]

interface MonthlySummaryListProps {
  /** The current page from the server; kept while the next one loads. */
  data: PagedResponse<MonthlySummaryResponseDto> | undefined
  status: MonthlySummariesStatus
  isFetching: boolean
  years: number[]
  year: number | null
  onYearChange: (year: number | null) => void
  balance: BalanceFilter
  onBalanceChange: (balance: BalanceFilter) => void
  hasFilters: boolean
  onClearFilters: () => void
  sortBy: MonthlySummarySortBy
  sortDirection: SortDirection
  /** Header click (wide screens): flips the active column, or switches to a new one. */
  onSortByColumn: (column: MonthlySummarySortBy) => void
  /** Compact screens pick the column and the direction separately. */
  onSortByChange: (column: MonthlySummarySortBy) => void
  onToggleSortDirection: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
  onCreate: () => void
}

function isCurrentMonth(summary: MonthlySummaryResponseDto, today: Date) {
  return summary.year === today.getFullYear() && summary.month === today.getMonth() + 1
}

function MonthlySummaryList({
  data,
  status,
  isFetching,
  years,
  year,
  onYearChange,
  balance,
  onBalanceChange,
  hasFilters,
  onClearFilters,
  sortBy,
  sortDirection,
  onSortByColumn,
  onSortByChange,
  onToggleSortDirection,
  onPageChange,
  onRetry,
  onCreate,
}: MonthlySummaryListProps) {
  const { t: translate } = useTranslation('finance')
  const { periodLabel } = useFinanceFormat()
  const today = new Date()

  // The selected year stays listed even if it no longer comes back from the server.
  const yearOptions = [
    { value: ALL_YEARS, label: translate('finance:months.list.filters.allYears') },
    ...[...new Set(year === null ? years : [...years, year])]
      .sort((a, b) => b - a)
      .map((option) => ({ value: String(option), label: String(option) })),
  ]

  const sortedLabel = translate(sortDirection === 'Asc' ? 'finance:months.list.sort.ascending' : 'finance:months.list.sort.descending')

  function renderRows() {
    if (status === 'loading') {
      return <div className="lm-month-list__state">{translate('finance:months.list.loading')}</div>
    }

    if (status === 'error' || !data) {
      return (
        <div className="lm-month-list__state">
          <span>{translate('finance:months.list.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {translate('finance:months.list.retry')}
          </Button>
        </div>
      )
    }

    if (data.totalCount === 0) {
      return hasFilters ? (
        <div className="lm-month-list__state">
          <span>{translate('finance:months.list.noResults')}</span>
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            {translate('finance:months.list.filters.clearAll')}
          </Button>
        </div>
      ) : (
        <div className="lm-month-list__state">
          <span>{translate('finance:months.list.empty')}</span>
          <Button variant="secondary" size="sm" icon="plus" onClick={onCreate}>
            {translate('finance:months.newButton')}
          </Button>
        </div>
      )
    }

    return data.items.map((summary) => (
      <div key={summary.id} className="lm-month-list__row">
        <span className="lm-month-list__period">
          <Link to={`/finance/months/${summary.id}`} className="lm-month-list__period-label">
            {periodLabel(summary.month, summary.year)}
          </Link>
          {isCurrentMonth(summary, today) ? (
            <span className="lm-month-list__badge">{translate('finance:months.list.currentMonth')}</span>
          ) : null}
        </span>
        <span className="lm-month-list__cell lm-month-list__cell--income">
          <span className="lm-month-list__cell-label">{translate('finance:months.list.columns.TotalIncome')}</span>
          <Amount value={summary.totalIncome} tone="positive" />
        </span>
        <span className="lm-month-list__cell lm-month-list__cell--expense">
          <span className="lm-month-list__cell-label">{translate('finance:months.list.columns.TotalExpense')}</span>
          <Amount value={summary.totalExpense} tone="negative" />
        </span>
        <span className="lm-month-list__cell lm-month-list__cell--investment">
          <span className="lm-month-list__cell-label">{translate('finance:months.list.columns.TotalInvestment')}</span>
          <Amount value={summary.totalInvestment} tone="investment" />
        </span>
        <span className="lm-month-list__cell lm-month-list__cell--balance">
          <span className="lm-month-list__cell-label">{translate('finance:months.list.columns.Balance')}</span>
          <Amount value={summary.balance} tone="signed" emphasis />
        </span>
      </div>
    ))
  }

  function rangeLabel(page: PagedResponse<MonthlySummaryResponseDto>) {
    if (page.totalCount === 0) return translate('finance:months.pagination.none')

    const from = (page.page - 1) * page.pageSize + 1
    return translate('finance:months.pagination.range', {
      from,
      to: from + page.items.length - 1,
      count: page.totalCount,
    })
  }

  return (
    <section
      className={`lm-month-list${isFetching && status === 'ready' ? ' lm-month-list--fetching' : ''}`}
      aria-busy={isFetching}
    >
      <div className="lm-month-list__toolbar">
        <div className="lm-month-list__heading">
          <h2 className="lm-month-list__title">{translate('finance:months.list.title')}</h2>
          {status === 'ready' && data ? (
            <span className="lm-month-list__count">
              {translate(hasFilters ? 'finance:months.list.results' : 'finance:months.list.count', { count: data.totalCount })}
            </span>
          ) : null}
        </div>

        <div className="lm-month-list__filters">
          <Select
            size="sm"
            label={translate('finance:months.list.filters.year')}
            options={yearOptions}
            value={year === null ? ALL_YEARS : String(year)}
            onChange={(event) => onYearChange(event.target.value === ALL_YEARS ? null : Number(event.target.value))}
            containerClassName="lm-month-list__year"
          />
          <div className="lm-month-list__balance">
            <span className="lm-month-list__filter-label" aria-hidden="true">
              {translate('finance:months.list.filters.balance')}
            </span>
            <SegmentedControl
              size="md"
              aria-label={translate('finance:months.list.filters.balance')}
              options={BALANCE_FILTERS.map((option) => ({
                value: option,
                label: translate(`finance:months.list.filters.balanceOptions.${option}`),
              }))}
              value={balance}
              onChange={onBalanceChange}
              className="lm-month-list__balance-control"
            />
          </div>
          {hasFilters ? (
            <Button variant="ghost" size="sm" icon="x" onClick={onClearFilters} className="lm-month-list__clear">
              {translate('finance:months.list.filters.clear')}
            </Button>
          ) : null}
        </div>

        <div className="lm-month-list__compact-sort">
          <Select
            size="sm"
            label={translate('finance:months.list.sort.label')}
            options={COLUMNS.map((column) => ({
              value: column.id,
              label: translate(`finance:months.list.columns.${column.id}`),
            }))}
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as MonthlySummarySortBy)}
            containerClassName="lm-month-list__compact-sort-select"
          />
          <IconButton
            icon={sortDirection === 'Asc' ? 'arrow-up-narrow-wide' : 'arrow-down-wide-narrow'}
            variant="secondary"
            size="sm"
            label={`${translate('finance:months.list.sort.toggleDirection')} (${sortedLabel})`}
            title={sortedLabel}
            onClick={onToggleSortDirection}
          />
        </div>
      </div>

      <div className="lm-month-list__columns">
        {COLUMNS.map((column) => {
          const active = column.id === sortBy
          return (
            <button
              key={column.id}
              type="button"
              className={[
                'lm-month-list__sort',
                column.numeric && 'lm-month-list__sort--numeric',
                active && 'lm-month-list__sort--active',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSortByColumn(column.id)}
            >
              {translate(`finance:months.list.columns.${column.id}`)}
              <Icon name={active && sortDirection === 'Asc' ? 'chevron-up' : 'chevron-down'} size={12} aria-hidden="true" />
              {active ? <span className="lm-month-list__visually-hidden">({sortedLabel})</span> : null}
            </button>
          )
        })}
      </div>

      <div className="lm-month-list__rows">{renderRows()}</div>

      {status === 'ready' && data ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={rangeLabel(data)} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

export default MonthlySummaryList
