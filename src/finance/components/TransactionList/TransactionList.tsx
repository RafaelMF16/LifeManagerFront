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
import type { TransactionsStatus } from '../../hooks/useTransactions'
import type { CategoryResponseDto } from '../../types/CategoryDtos'
import type {
  MoneyFlowType,
  TransactionResponseDto,
  TransactionSortBy,
  TransactionTypeFilter,
} from '../../types/TransactionDtos'
import Amount from '../Amount/Amount'
import './TransactionList.css'

const ALL_CATEGORIES = 'all'
const TYPE_FILTERS: TransactionTypeFilter[] = ['All', 'Income', 'Expense', 'Investment']

// How each type reads in a row. Money leaving the account (expense, investment) shows negative, so the
// list matches the Amount sort, which orders by the signed value.
const TYPE_DISPLAY: Record<MoneyFlowType, { icon: IconName; modifier: string; labelKey: string; sign: 1 | -1 }> = {
  Income: { icon: 'arrow-down-left', modifier: 'income', labelKey: 'finance:transactions.list.income', sign: 1 },
  Expense: { icon: 'arrow-up-right', modifier: 'expense', labelKey: 'finance:transactions.list.expense', sign: -1 },
  Investment: {
    icon: 'piggy-bank',
    modifier: 'investment',
    labelKey: 'finance:transactions.list.investment',
    sign: -1,
  },
}

// `id` doubles as an i18next key lookup (`finance:transactions.list.columns.${id}`).
const COLUMNS: { id: TransactionSortBy; numeric: boolean }[] = [
  { id: 'Date', numeric: false },
  { id: 'Description', numeric: false },
  { id: 'Category', numeric: false },
  { id: 'Amount', numeric: true },
]

interface TransactionListProps {
  /** The current page from the server; kept while the next one loads. */
  data: PagedResponse<TransactionResponseDto> | undefined
  status: TransactionsStatus
  isFetching: boolean
  /** How many transactions the month has in all, to tell "empty month" apart from "no results". */
  monthTransactionCount: number
  categories: CategoryResponseDto[]
  type: TransactionTypeFilter
  onTypeChange: (type: TransactionTypeFilter) => void
  categoryId: number | null
  onCategoryChange: (categoryId: number | null) => void
  searchInput: string
  onSearchChange: (value: string) => void
  hasFilters: boolean
  onClearFilters: () => void
  sortBy: TransactionSortBy
  sortDirection: SortDirection
  /** Header click (wide screens): flips the active column, or switches to a new one. */
  onSortByColumn: (column: TransactionSortBy) => void
  /** Compact screens pick the column and the direction separately. */
  onSortByChange: (column: TransactionSortBy) => void
  onToggleSortDirection: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
  onCreate: () => void
  onEdit: (transaction: TransactionResponseDto) => void
  onDelete: (transaction: TransactionResponseDto) => void
}

function TransactionList({
  data,
  status,
  isFetching,
  monthTransactionCount,
  categories,
  type,
  onTypeChange,
  categoryId,
  onCategoryChange,
  searchInput,
  onSearchChange,
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
  onEdit,
  onDelete,
}: TransactionListProps) {
  const { t: translate } = useTranslation('finance')
  const { dayLabel } = useFinanceFormat()

  const categoryOptions = [
    { value: ALL_CATEGORIES, label: translate('finance:transactions.list.filters.allCategories') },
    ...categories.map((category) => ({ value: String(category.id), label: category.name })),
  ]

  const sortedLabel = translate(
    sortDirection === 'Asc' ? 'finance:transactions.list.sort.ascending' : 'finance:transactions.list.sort.descending',
  )

  function renderRows() {
    if (status === 'loading') {
      return <div className="lm-transaction-list__state">{translate('finance:transactions.list.loading')}</div>
    }

    if (status === 'error' || !data) {
      return (
        <div className="lm-transaction-list__state">
          <span>{translate('finance:transactions.list.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {translate('finance:transactions.list.retry')}
          </Button>
        </div>
      )
    }

    if (data.totalCount === 0) {
      return hasFilters ? (
        <div className="lm-transaction-list__state">
          <span>{translate('finance:transactions.list.noResults')}</span>
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            {translate('finance:transactions.list.filters.clearAll')}
          </Button>
        </div>
      ) : (
        <div className="lm-transaction-list__state">
          <span>{translate('finance:transactions.list.empty')}</span>
          <Button variant="secondary" size="sm" icon="plus" onClick={onCreate}>
            {translate('finance:transactions.newButton')}
          </Button>
        </div>
      )
    }

    return data.items.map((transaction) => {
      const display = TYPE_DISPLAY[transaction.type]
      return (
        <div key={transaction.id} className="lm-transaction-list__row">
          <span className="lm-transaction-list__date lm-numeric">{dayLabel(transaction.date)}</span>
          <span className="lm-transaction-list__description">
            <Icon
              name={display.icon}
              size={16}
              className={`lm-transaction-list__type-icon lm-transaction-list__type-icon--${display.modifier}`}
              aria-label={translate(display.labelKey)}
              role="img"
            />
            <span className="lm-transaction-list__description-text">{transaction.description}</span>
          </span>
          <span className="lm-transaction-list__category">
            <span className="lm-transaction-list__badge">{transaction.categoryName}</span>
          </span>
          <span className="lm-transaction-list__amount">
            <Amount
              value={display.sign * transaction.amount}
              tone={transaction.type === 'Investment' ? 'investment' : 'signed'}
            />
          </span>
          <div className="lm-transaction-list__actions">
            <IconButton
              icon="pencil"
              size="sm"
              label={translate('finance:transactions.list.edit')}
              onClick={() => onEdit(transaction)}
            />
            <IconButton
              icon="trash-2"
              size="sm"
              label={translate('finance:transactions.list.delete')}
              onClick={() => onDelete(transaction)}
            />
          </div>
        </div>
      )
    })
  }

  function rangeLabel(page: PagedResponse<TransactionResponseDto>) {
    if (page.totalCount === 0) return translate('finance:transactions.pagination.none')

    const from = (page.page - 1) * page.pageSize + 1
    return translate('finance:transactions.pagination.range', {
      from,
      to: from + page.items.length - 1,
      count: page.totalCount,
    })
  }

  return (
    <section
      className={`lm-transaction-list${isFetching && status === 'ready' ? ' lm-transaction-list--fetching' : ''}`}
      aria-busy={isFetching}
    >
      <div className="lm-transaction-list__toolbar">
        <div className="lm-transaction-list__heading">
          <h2 className="lm-transaction-list__title">{translate('finance:transactions.list.title')}</h2>
          {status === 'ready' && data ? (
            <span className="lm-transaction-list__count">
              {hasFilters
                ? translate('finance:transactions.list.results', { count: data.totalCount })
                : translate('finance:transactions.list.count', { count: monthTransactionCount })}
            </span>
          ) : null}
        </div>

        <div className="lm-transaction-list__filters">
          <div className="lm-transaction-list__type">
            <span className="lm-transaction-list__filter-label" aria-hidden="true">
              {translate('finance:transactions.list.filters.type')}
            </span>
            <SegmentedControl
              size="md"
              aria-label={translate('finance:transactions.list.filters.type')}
              options={TYPE_FILTERS.map((option) => ({
                value: option,
                label: translate(`finance:transactions.list.filters.typeOptions.${option}`),
              }))}
              value={type}
              onChange={onTypeChange}
              className="lm-transaction-list__type-control"
            />
          </div>
          <Select
            size="sm"
            label={translate('finance:transactions.list.filters.category')}
            options={categoryOptions}
            value={categoryId === null ? ALL_CATEGORIES : String(categoryId)}
            onChange={(event) => onCategoryChange(event.target.value === ALL_CATEGORIES ? null : Number(event.target.value))}
            containerClassName="lm-transaction-list__category-filter"
          />
          <Input
            type="search"
            size="sm"
            icon="search"
            placeholder={translate('finance:transactions.list.filters.searchPlaceholder')}
            aria-label={translate('finance:transactions.list.filters.searchPlaceholder')}
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            containerClassName="lm-transaction-list__search"
          />
          {hasFilters ? (
            <Button variant="ghost" size="sm" icon="x" onClick={onClearFilters} className="lm-transaction-list__clear">
              {translate('finance:transactions.list.filters.clear')}
            </Button>
          ) : null}
        </div>

        <div className="lm-transaction-list__compact-sort">
          <Select
            size="sm"
            label={translate('finance:transactions.list.sort.label')}
            options={COLUMNS.map((column) => ({
              value: column.id,
              label: translate(`finance:transactions.list.columns.${column.id}`),
            }))}
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as TransactionSortBy)}
            containerClassName="lm-transaction-list__compact-sort-select"
          />
          <IconButton
            icon={sortDirection === 'Asc' ? 'arrow-up-narrow-wide' : 'arrow-down-wide-narrow'}
            variant="secondary"
            size="sm"
            label={`${translate('finance:transactions.list.sort.toggleDirection')} (${sortedLabel})`}
            title={sortedLabel}
            onClick={onToggleSortDirection}
          />
        </div>
      </div>

      <div className="lm-transaction-list__columns">
        {COLUMNS.map((column) => {
          const active = column.id === sortBy
          return (
            <button
              key={column.id}
              type="button"
              className={[
                'lm-transaction-list__sort',
                column.numeric && 'lm-transaction-list__sort--numeric',
                active && 'lm-transaction-list__sort--active',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSortByColumn(column.id)}
            >
              {translate(`finance:transactions.list.columns.${column.id}`)}
              <Icon name={active && sortDirection === 'Asc' ? 'chevron-up' : 'chevron-down'} size={12} aria-hidden="true" />
              {active ? <span className="lm-transaction-list__visually-hidden">({sortedLabel})</span> : null}
            </button>
          )
        })}
        <span aria-hidden="true" />
      </div>

      <div className="lm-transaction-list__rows">{renderRows()}</div>

      {status === 'ready' && data ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={rangeLabel(data)} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

export default TransactionList
