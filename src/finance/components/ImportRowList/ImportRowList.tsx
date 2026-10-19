import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import type { IconName } from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import Pagination from '../../../shared/components/Pagination/Pagination'
import Select from '../../../shared/components/Select/Select'
import type { PagedResponse, SortDirection } from '../../../shared/types/Paging'
import type { CategoryOptionsStatus } from '../../hooks/useCategoryOptions'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { ImportRowsStatus } from '../../hooks/useImportRows'
import type { CategoryResponseDto } from '../../types/CategoryDtos'
import type { StatementImportRowDto, StatementImportRowFilter, StatementImportRowSortBy } from '../../types/StatementImportDtos'
import type { MoneyFlowType } from '../../types/TransactionDtos'
import Amount from '../Amount/Amount'
import './ImportRowList.css'

const FILTERS: StatementImportRowFilter[] = ['All', 'Uncategorized', 'Suggested', 'Duplicates', 'Excluded']
const SORT_OPTIONS: StatementImportRowSortBy[] = ['Date', 'Description', 'Category', 'Amount']

/** The category select's extra option that opens the new-category form instead of filing the row. */
export const NEW_CATEGORY_OPTION = '__new'

// Same reading as the transactions list: money leaving the account (expense, investment) shows negative.
const TYPE_DISPLAY: Record<MoneyFlowType, { icon: IconName; modifier: string; sign: 1 | -1 }> = {
  Income: { icon: 'arrow-down-left', modifier: 'income', sign: 1 },
  Expense: { icon: 'arrow-up-right', modifier: 'expense', sign: -1 },
  Investment: { icon: 'piggy-bank', modifier: 'investment', sign: -1 },
}

interface ImportRowListProps {
  data: PagedResponse<StatementImportRowDto> | undefined
  status: ImportRowsStatus
  isFetching: boolean
  filter: StatementImportRowFilter
  onFilterChange: (filter: StatementImportRowFilter) => void
  searchInput: string
  onSearchChange: (value: string) => void
  hasFilters: boolean
  onClearFilters: () => void
  sortBy: StatementImportRowSortBy
  sortDirection: SortDirection
  onSortByChange: (sortBy: StatementImportRowSortBy) => void
  onToggleSortDirection: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
  categories: CategoryResponseDto[]
  categoriesStatus: CategoryOptionsStatus
  selectedIds: ReadonlySet<number>
  onToggleSelected: (rowId: number) => void
  /** Selects every row of the page, or clears the selection when they all are selected already. */
  onToggleSelectPage: (rowIds: number[]) => void
  /** Rows whose change is being saved: their controls wait. */
  pendingIds: ReadonlySet<number>
  /** The select's value: a category id, `''` (no category) or `NEW_CATEGORY_OPTION` (create one). */
  onCategoryChange: (row: StatementImportRowDto, value: string) => void
  onToggleIncluded: (row: StatementImportRowDto) => void
  onEdit: (row: StatementImportRowDto) => void
  /** Rendered above the rows while some are selected (actions on the selection). */
  bulkBar?: ReactNode
}

/**
 * A draft's lines as cards: date, description (and the bank's text), amount, category select, and why it was filed
 * that way (a suggestion, a possible duplicate, left out). Filters, search, sort and pages run on the server.
 */
function ImportRowList({
  data,
  status,
  isFetching,
  filter,
  onFilterChange,
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
  categories,
  categoriesStatus,
  selectedIds,
  onToggleSelected,
  onToggleSelectPage,
  pendingIds,
  onCategoryChange,
  onToggleIncluded,
  onEdit,
  bulkBar,
}: ImportRowListProps) {
  const { t: translate } = useTranslation('finance')
  const { dayLabel } = useFinanceFormat()

  const sortedLabel = translate(sortDirection === 'Asc' ? 'finance:imports.rows.sort.ascending' : 'finance:imports.rows.sort.descending')
  const pageIds = data?.items.map((row) => row.id) ?? []
  const pageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))

  function categoryOptions(row: StatementImportRowDto) {
    const options = [
      { value: '', label: translate('finance:imports.rows.categoryPlaceholder') },
      ...categories.map((category) => ({ value: String(category.id), label: category.name })),
    ]
    // The row's category stays selectable even if it isn't among the loaded options (more than 100 categories).
    if (row.categoryId !== null && !categories.some((category) => category.id === row.categoryId)) {
      options.push({ value: String(row.categoryId), label: row.categoryName ?? '' })
    }
    if (categoriesStatus === 'ready') options.push({ value: NEW_CATEGORY_OPTION, label: translate('finance:imports.rows.newCategory') })
    return options
  }

  function renderBadges(row: StatementImportRowDto) {
    const badges = []

    if (row.duplicateOfTransactionId !== null) {
      badges.push(
        <span key="duplicate" className="lm-import-rows__badge lm-import-rows__badge--duplicate">
          <Icon name="copy" size={12} aria-hidden="true" />
          {translate('finance:imports.rows.duplicateBadge')}
          {row.duplicateOfMonthlySummaryId !== null ? (
            <Link to={`/finance/months/${row.duplicateOfMonthlySummaryId}`} target="_blank" rel="noreferrer" className="lm-import-rows__badge-link">
              {translate('finance:imports.rows.duplicateLink')}
            </Link>
          ) : null}
        </span>,
      )
    }

    const suggested = row.suggestionSource !== 'None' && !row.editedByUser
    if (suggested && !row.included && row.categoryId === null && row.duplicateOfTransactionId === null) {
      badges.push(
        <span key="ignored" className="lm-import-rows__badge lm-import-rows__badge--suggestion">
          <Icon name="sparkles" size={12} aria-hidden="true" />
          {translate('finance:imports.rows.ignoredBefore')}
        </span>,
      )
    } else if (suggested && row.suggestionConfidence) {
      badges.push(
        <span
          key="suggestion"
          className={`lm-import-rows__badge lm-import-rows__badge--suggestion lm-import-rows__badge--${row.suggestionConfidence.toLowerCase()}`}
        >
          <Icon name="sparkles" size={12} aria-hidden="true" />
          {translate(`finance:imports.rows.suggestion.${row.suggestionSource}`)}
          {' · '}
          {translate(`finance:imports.rows.confidence.${row.suggestionConfidence}`)}
          {row.suggestionUses > 0 ? ` · ${translate('finance:imports.rows.uses', { count: row.suggestionUses })}` : ''}
        </span>,
      )
    }

    if (!row.included && row.duplicateOfTransactionId === null && !(suggested && row.categoryId === null)) {
      badges.push(
        <span key="excluded" className="lm-import-rows__badge">
          {translate('finance:imports.rows.excludedBadge')}
        </span>,
      )
    }

    return badges.length > 0 ? <span className="lm-import-rows__badges">{badges}</span> : null
  }

  function renderRow(row: StatementImportRowDto) {
    const display = TYPE_DISPLAY[row.type]
    const pending = pendingIds.has(row.id)
    const showsOriginal = row.originalDescription !== row.description
    const missingCategory = row.included && row.categoryId === null

    return (
      <li
        key={row.id}
        className={[
          'lm-import-rows__row',
          !row.included && 'lm-import-rows__row--excluded',
          selectedIds.has(row.id) && 'lm-import-rows__row--selected',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          type="checkbox"
          className="lm-import-rows__select"
          checked={selectedIds.has(row.id)}
          onChange={() => onToggleSelected(row.id)}
          aria-label={translate('finance:imports.rows.select', { description: row.description })}
        />

        <div className="lm-import-rows__main">
          <span className="lm-import-rows__date lm-numeric">
            {dayLabel(row.date)} {row.date.slice(0, 4)}
          </span>
          <span className="lm-import-rows__description">
            <Icon
              name={display.icon}
              size={16}
              className={`lm-import-rows__type-icon lm-import-rows__type-icon--${display.modifier}`}
              aria-label={translate(`finance:imports.rows.types.${row.type}`)}
              role="img"
            />
            <span className="lm-import-rows__description-text">{row.description}</span>
          </span>
          {showsOriginal ? (
            <span className="lm-import-rows__original">{translate('finance:imports.rows.original', { text: row.originalDescription })}</span>
          ) : null}
          {renderBadges(row)}
        </div>

        <div className="lm-import-rows__amount">
          <Amount value={display.sign * row.amount} tone={row.type === 'Investment' ? 'investment' : 'signed'} />
        </div>

        <Select
          size="sm"
          aria-label={translate('finance:imports.rows.category')}
          options={categoryOptions(row)}
          value={row.categoryId === null ? '' : String(row.categoryId)}
          disabled={pending || categoriesStatus === 'loading'}
          aria-invalid={missingCategory || undefined}
          onChange={(event) => onCategoryChange(row, event.target.value)}
          containerClassName={`lm-import-rows__category${missingCategory ? ' lm-import-rows__category--missing' : ''}`}
        />

        <div className="lm-import-rows__actions">
          <IconButton
            icon={row.included ? 'eye-off' : 'eye'}
            size="sm"
            label={translate(row.included ? 'finance:imports.rows.exclude' : 'finance:imports.rows.include')}
            title={translate(row.included ? 'finance:imports.rows.exclude' : 'finance:imports.rows.include')}
            disabled={pending}
            onClick={() => onToggleIncluded(row)}
          />
          <IconButton icon="pencil" size="sm" label={translate('finance:imports.rows.edit')} disabled={pending} onClick={() => onEdit(row)} />
        </div>
      </li>
    )
  }

  function renderBody() {
    if (status === 'loading') return <div className="lm-import-rows__state">{translate('finance:imports.rows.loading')}</div>

    if (status === 'error' || !data) {
      return (
        <div className="lm-import-rows__state">
          <span>{translate('finance:imports.rows.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {translate('finance:imports.rows.retry')}
          </Button>
        </div>
      )
    }

    if (data.totalCount === 0) {
      return (
        <div className="lm-import-rows__state">
          <span>{translate('finance:imports.rows.empty')}</span>
          {hasFilters ? (
            <Button variant="secondary" size="sm" onClick={onClearFilters}>
              {translate('finance:imports.rows.filters.clearAll')}
            </Button>
          ) : null}
        </div>
      )
    }

    return <ul className="lm-import-rows__items">{data.items.map(renderRow)}</ul>
  }

  function rangeLabel(page: PagedResponse<StatementImportRowDto>) {
    if (page.totalCount === 0) return translate('finance:imports.rows.pagination.none')
    const from = (page.page - 1) * page.pageSize + 1
    return translate('finance:imports.rows.pagination.range', { from, to: from + page.items.length - 1, count: page.totalCount })
  }

  return (
    <section className={`lm-import-rows${isFetching && status === 'ready' ? ' lm-import-rows--fetching' : ''}`} aria-busy={isFetching}>
      <div className="lm-import-rows__toolbar">
        <div className="lm-import-rows__heading">
          <h2 className="lm-import-rows__title">{translate('finance:imports.rows.title')}</h2>
          {status === 'ready' && data ? (
            <span className="lm-import-rows__count">{translate('finance:imports.rows.count', { count: data.totalCount })}</span>
          ) : null}
        </div>

        <div className="lm-import-rows__filters">
          <Select
            size="sm"
            label={translate('finance:imports.rows.filters.label')}
            options={FILTERS.map((option) => ({ value: option, label: translate(`finance:imports.rows.filters.options.${option}`) }))}
            value={filter}
            onChange={(event) => onFilterChange(event.target.value as StatementImportRowFilter)}
            containerClassName="lm-import-rows__filter"
          />
          <Input
            type="search"
            size="sm"
            icon="search"
            placeholder={translate('finance:imports.rows.filters.searchPlaceholder')}
            aria-label={translate('finance:imports.rows.filters.searchPlaceholder')}
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            containerClassName="lm-import-rows__search"
          />
          {hasFilters ? (
            <Button variant="ghost" size="sm" icon="x" onClick={onClearFilters} className="lm-import-rows__clear">
              {translate('finance:imports.rows.filters.clear')}
            </Button>
          ) : null}
        </div>

        <div className="lm-import-rows__sort">
          <Select
            size="sm"
            label={translate('finance:imports.rows.sort.label')}
            options={SORT_OPTIONS.map((option) => ({ value: option, label: translate(`finance:imports.rows.sort.options.${option}`) }))}
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as StatementImportRowSortBy)}
            containerClassName="lm-import-rows__sort-select"
          />
          <IconButton
            icon={sortDirection === 'Asc' ? 'arrow-up-narrow-wide' : 'arrow-down-wide-narrow'}
            variant="secondary"
            size="sm"
            label={`${translate('finance:imports.rows.sort.toggleDirection')} (${sortedLabel})`}
            title={sortedLabel}
            onClick={onToggleSortDirection}
          />
        </div>
      </div>

      {status === 'ready' && data && data.items.length > 0 ? (
        <label className="lm-import-rows__select-page">
          <input type="checkbox" checked={pageSelected} onChange={() => onToggleSelectPage(pageIds)} />
          {translate('finance:imports.rows.selectPage')}
        </label>
      ) : null}

      {bulkBar}

      <div className="lm-import-rows__body">{renderBody()}</div>

      {status === 'ready' && data ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={rangeLabel(data)} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

export default ImportRowList
