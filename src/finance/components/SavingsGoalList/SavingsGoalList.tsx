import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import Pagination from '../../../shared/components/Pagination/Pagination'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import Select from '../../../shared/components/Select/Select'
import type { PagedResponse, SortDirection } from '../../../shared/types/Paging'
import type { SavingsGoalsStatus } from '../../hooks/useSavingsGoals'
import type { SavingsGoalResponseDto, SavingsGoalSortBy, SavingsGoalStatusFilter } from '../../types/SavingsGoalDtos'
import SavingsGoalCard from '../SavingsGoalCard/SavingsGoalCard'
import SavingsGoalListSkeleton from './SavingsGoalListSkeleton'
import './SavingsGoalList.css'

const STATUS_FILTERS: SavingsGoalStatusFilter[] = ['Active', 'Completed', 'Archived']
const SORT_OPTIONS: SavingsGoalSortBy[] = ['Name', 'TargetMonth', 'Progress']

interface SavingsGoalListProps {
  /** The current page from the server; kept while the next one loads. */
  data: PagedResponse<SavingsGoalResponseDto> | undefined
  status: SavingsGoalsStatus
  isFetching: boolean
  statusFilter: SavingsGoalStatusFilter
  onStatusFilterChange: (status: SavingsGoalStatusFilter) => void
  searchInput: string
  onSearchChange: (value: string) => void
  hasSearch: boolean
  onClearSearch: () => void
  sortBy: SavingsGoalSortBy
  sortDirection: SortDirection
  onSortByChange: (sortBy: SavingsGoalSortBy) => void
  onToggleSortDirection: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
  onCreate: () => void
  onEdit: (goal: SavingsGoalResponseDto) => void
  onArchive: (goal: SavingsGoalResponseDto) => void
  onRestore: (goal: SavingsGoalResponseDto) => void
  /** The goal whose restore is in flight, so its button can't be pressed twice. */
  pendingId: number | null
}

/** The user's savings goals as cards (one column on phones), with the status filter, the search and the sort. */
function SavingsGoalList({
  data,
  status,
  isFetching,
  statusFilter,
  onStatusFilterChange,
  searchInput,
  onSearchChange,
  hasSearch,
  onClearSearch,
  sortBy,
  sortDirection,
  onSortByChange,
  onToggleSortDirection,
  onPageChange,
  onRetry,
  onCreate,
  onEdit,
  onArchive,
  onRestore,
  pendingId,
}: SavingsGoalListProps) {
  const { t: translate } = useTranslation('finance')

  const sortedLabel = translate(
    sortDirection === 'Asc' ? 'finance:savingsGoals.list.sort.ascending' : 'finance:savingsGoals.list.sort.descending',
  )

  function renderActions(goal: SavingsGoalResponseDto) {
    if (goal.archivedAt !== null) {
      return (
        <IconButton
          icon="archive-restore"
          size="sm"
          label={translate('finance:savingsGoals.list.restore')}
          disabled={pendingId === goal.id}
          onClick={() => onRestore(goal)}
        />
      )
    }
    return (
      <>
        <IconButton icon="pencil" size="sm" label={translate('finance:savingsGoals.list.edit')} onClick={() => onEdit(goal)} />
        <IconButton icon="archive" size="sm" label={translate('finance:savingsGoals.list.archive')} onClick={() => onArchive(goal)} />
      </>
    )
  }

  function renderCards() {
    if (status === 'loading') return <SavingsGoalListSkeleton />

    if (status === 'error' || !data) {
      return (
        <div className="lm-goal-list__state">
          <span>{translate('finance:savingsGoals.list.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {translate('finance:savingsGoals.list.retry')}
          </Button>
        </div>
      )
    }

    if (data.totalCount === 0) {
      if (hasSearch) {
        return (
          <div className="lm-goal-list__state">
            <span>{translate('finance:savingsGoals.list.noResults')}</span>
            <Button variant="secondary" size="sm" onClick={onClearSearch}>
              {translate('finance:savingsGoals.list.filters.clearAll')}
            </Button>
          </div>
        )
      }
      return (
        <div className="lm-goal-list__state">
          <span className="lm-goal-list__state-title">{translate(`finance:savingsGoals.list.empty.${statusFilter}`)}</span>
          {statusFilter === 'Active' ? (
            <>
              <span>{translate('finance:savingsGoals.list.emptyHint')}</span>
              <Button variant="secondary" size="sm" icon="plus" onClick={onCreate}>
                {translate('finance:savingsGoals.newButton')}
              </Button>
            </>
          ) : null}
        </div>
      )
    }

    return (
      <div className="lm-goal-list__grid">
        {data.items.map((goal, index) => (
          <SavingsGoalCard
            key={goal.id}
            goal={goal}
            tourTarget={index === 0 ? 'savings.card' : undefined}
            title={
              <Link to={String(goal.id)} aria-label={translate('finance:savingsGoals.list.open', { name: goal.name })}>
                {goal.name}
              </Link>
            }
            actions={renderActions(goal)}
          />
        ))}
      </div>
    )
  }

  function rangeLabel(page: PagedResponse<SavingsGoalResponseDto>) {
    if (page.totalCount === 0) return translate('finance:savingsGoals.pagination.none')

    const from = (page.page - 1) * page.pageSize + 1
    return translate('finance:savingsGoals.pagination.range', { from, to: from + page.items.length - 1, count: page.totalCount })
  }

  return (
    <section
      className={`lm-goal-list${isFetching && status === 'ready' ? ' lm-goal-list--fetching' : ''}`}
      aria-busy={isFetching}
    >
      <div className="lm-goal-list__toolbar" data-tour="savings.filters">
        <div className="lm-goal-list__heading">
          <h2 className="lm-goal-list__title">{translate('finance:savingsGoals.list.title')}</h2>
          {status === 'ready' && data ? (
            <span className="lm-goal-list__count">
              {translate(hasSearch ? 'finance:savingsGoals.list.results' : 'finance:savingsGoals.list.count', { count: data.totalCount })}
            </span>
          ) : null}
        </div>

        <div className="lm-goal-list__filters">
          <SegmentedControl
            size="md"
            aria-label={translate('finance:savingsGoals.list.filters.status')}
            options={STATUS_FILTERS.map((option) => ({
              value: option,
              label: translate(`finance:savingsGoals.list.filters.statusOptions.${option}`),
            }))}
            value={statusFilter}
            onChange={onStatusFilterChange}
            className="lm-goal-list__status-control"
          />
          <Input
            type="search"
            size="sm"
            icon="search"
            placeholder={translate('finance:savingsGoals.list.filters.searchPlaceholder')}
            aria-label={translate('finance:savingsGoals.list.filters.searchPlaceholder')}
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            containerClassName="lm-goal-list__search"
          />
          <div className="lm-goal-list__sort">
            <Select
              size="sm"
              label={translate('finance:savingsGoals.list.sort.label')}
              options={SORT_OPTIONS.map((option) => ({
                value: option,
                label: translate(`finance:savingsGoals.list.sort.options.${option}`),
              }))}
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as SavingsGoalSortBy)}
              containerClassName="lm-goal-list__sort-select"
            />
            <IconButton
              icon={sortDirection === 'Asc' ? 'arrow-up-narrow-wide' : 'arrow-down-wide-narrow'}
              variant="secondary"
              size="sm"
              label={`${translate('finance:savingsGoals.list.sort.toggleDirection')} (${sortedLabel})`}
              title={sortedLabel}
              onClick={onToggleSortDirection}
            />
          </div>
        </div>
      </div>

      <div className="lm-goal-list__cards">{renderCards()}</div>

      {status === 'ready' && data && data.totalPages > 1 ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={rangeLabel(data)} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

export default SavingsGoalList
