import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import Pagination from '../../../shared/components/Pagination/Pagination'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import Select from '../../../shared/components/Select/Select'
import type { PagedResponse, SortDirection } from '../../../shared/types/Paging'
import type { HabitsStatus } from '../../hooks/useHabits'
import type { HabitResponseDto, HabitSortBy, HabitStatusFilter } from '../../types/HabitDtos'
import { formatFrequency } from '../../utils/formatFrequency'
import './HabitList.css'

const STATUS_FILTERS: HabitStatusFilter[] = ['Active', 'Archived']
const SORT_OPTIONS: HabitSortBy[] = ['Name', 'CreatedAt']

interface HabitListProps {
  /** The current page from the server; kept while the next one loads. */
  data: PagedResponse<HabitResponseDto> | undefined
  status: HabitsStatus
  isFetching: boolean
  statusFilter: HabitStatusFilter
  onStatusFilterChange: (status: HabitStatusFilter) => void
  searchInput: string
  onSearchChange: (value: string) => void
  /** The search applied to `data` — tells "no habits yet" apart from "no results". */
  appliedSearch: string
  sortBy: HabitSortBy
  sortDirection: SortDirection
  onSortByChange: (sortBy: HabitSortBy) => void
  onToggleSortDirection: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
  onCreate: () => void
  onEdit: (habit: HabitResponseDto) => void
  onArchive: (habit: HabitResponseDto) => void
  onRestore: (habit: HabitResponseDto) => void
  /** The habit whose restore is in flight, so its button can't be pressed twice. */
  pendingId: number | null
}

/** The user's habits: name, type, difficulty, how often, the cue and the current streak. */
function HabitList({
  data,
  status,
  isFetching,
  statusFilter,
  onStatusFilterChange,
  searchInput,
  onSearchChange,
  appliedSearch,
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
}: HabitListProps) {
  const { t: translate, i18n } = useTranslation('habits')
  const hasSearch = appliedSearch !== ''
  const showingArchived = statusFilter === 'Archived'

  const sortedLabel = translate(
    sortDirection === 'Asc' ? 'habits:habits.list.sort.ascending' : 'habits:habits.list.sort.descending',
  )

  function renderEmpty() {
    if (hasSearch) {
      return <div className="lm-habit-list__state">{translate('habits:habits.list.noResults')}</div>
    }

    if (showingArchived) {
      return <div className="lm-habit-list__state">{translate('habits:habits.list.noArchived')}</div>
    }

    return (
      <div className="lm-habit-list__state">
        <span className="lm-habit-list__state-title">{translate('habits:habits.list.empty')}</span>
        <span>{translate('habits:habits.list.emptyHint')}</span>
        <Button variant="secondary" size="sm" icon="plus" onClick={onCreate}>
          {translate('habits:habits.newButton')}
        </Button>
      </div>
    )
  }

  /** The current streak, with the record always beside it: a broken streak never erases the best one. */
  function renderStreak(habit: HabitResponseDto) {
    const label = translate(
      habit.frequencyType === 'TimesPerWeek' ? 'habits:habits.list.streakWeeks' : 'habits:habits.list.streakDays',
      { count: habit.currentStreak },
    )
    const record = translate('habits:habits.list.record', { count: habit.longestStreak })
    return (
      <span className="lm-habit-list__streaks">
        <span
          className={`lm-habit-list__streak${habit.currentStreak > 0 ? ' lm-habit-list__streak--on' : ''}`}
          title={label}
        >
          <Icon name="flame" size={14} aria-hidden="true" />
          <span aria-hidden="true">{habit.currentStreak}</span>
          <span className="lm-habit-list__visually-hidden">{label}</span>
        </span>
        {habit.longestStreak > 0 ? <span className="lm-habit-list__record">{record}</span> : null}
      </span>
    )
  }

  function renderRows() {
    if (status === 'loading') {
      return <div className="lm-habit-list__state">{translate('habits:habits.list.loading')}</div>
    }

    if (status === 'error' || !data) {
      return (
        <div className="lm-habit-list__state">
          <span>{translate('habits:habits.list.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {translate('habits:habits.list.retry')}
          </Button>
        </div>
      )
    }

    if (data.totalCount === 0) return renderEmpty()

    return data.items.map((habit) => (
      <div key={habit.id} className={`lm-habit-list__row${habit.archivedAt ? ' lm-habit-list__row--archived' : ''}`}>
        <div className="lm-habit-list__main">
          <Link to={`/habits/list/${habit.id}`} className="lm-habit-list__name">
            {habit.name}
          </Link>
          <span className="lm-habit-list__meta">
            <span className={`lm-habit-list__badge lm-habit-list__badge--${habit.kind.toLowerCase()}`}>
              {translate(`habits:habits.list.kind.${habit.kind}`)}
            </span>
            <span className="lm-habit-list__badge">{translate(`habits:habits.list.difficulty.${habit.difficulty}`)}</span>
            <span className="lm-habit-list__frequency">{formatFrequency(habit, translate, i18n.language)}</span>
          </span>
          {habit.trigger ? <span className="lm-habit-list__trigger">{habit.trigger}</span> : null}
        </div>
        {renderStreak(habit)}
        <div className="lm-habit-list__actions">
          {habit.archivedAt ? (
            <IconButton
              icon="archive-restore"
              size="sm"
              label={translate('habits:habits.list.restore')}
              disabled={pendingId === habit.id}
              onClick={() => onRestore(habit)}
            />
          ) : (
            <>
              <IconButton icon="pencil" size="sm" label={translate('habits:habits.list.edit')} onClick={() => onEdit(habit)} />
              <IconButton icon="archive" size="sm" label={translate('habits:habits.list.archive')} onClick={() => onArchive(habit)} />
            </>
          )}
        </div>
      </div>
    ))
  }

  function rangeLabel(page: PagedResponse<HabitResponseDto>) {
    if (page.totalCount === 0) return translate('habits:habits.pagination.none')

    const from = (page.page - 1) * page.pageSize + 1
    return translate('habits:habits.pagination.range', { from, to: from + page.items.length - 1, count: page.totalCount })
  }

  return (
    <section
      className={`lm-habit-list${isFetching && status === 'ready' ? ' lm-habit-list--fetching' : ''}`}
      aria-busy={isFetching}
    >
      <div className="lm-habit-list__toolbar">
        <div className="lm-habit-list__heading">
          <h2 className="lm-habit-list__title">{translate('habits:habits.list.title')}</h2>
          {status === 'ready' && data ? (
            <span className="lm-habit-list__count">
              {translate(hasSearch ? 'habits:habits.list.results' : 'habits:habits.list.count', { count: data.totalCount })}
            </span>
          ) : null}
        </div>

        <div className="lm-habit-list__filters">
          <SegmentedControl
            size="md"
            aria-label={translate('habits:habits.list.statusLabel')}
            options={STATUS_FILTERS.map((option) => ({
              value: option,
              label: translate(`habits:habits.list.statusOptions.${option}`),
            }))}
            value={statusFilter}
            onChange={onStatusFilterChange}
            className="lm-habit-list__status"
          />
          <Input
            type="search"
            size="sm"
            icon="search"
            placeholder={translate('habits:habits.list.searchPlaceholder')}
            aria-label={translate('habits:habits.list.searchPlaceholder')}
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            containerClassName="lm-habit-list__search"
          />
          <div className="lm-habit-list__sort">
            <Select
              size="sm"
              aria-label={translate('habits:habits.list.sort.label')}
              options={SORT_OPTIONS.map((option) => ({
                value: option,
                label: translate(`habits:habits.list.sort.options.${option}`),
              }))}
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as HabitSortBy)}
              containerClassName="lm-habit-list__sort-select"
            />
            <IconButton
              icon={sortDirection === 'Asc' ? 'arrow-up-narrow-wide' : 'arrow-down-wide-narrow'}
              variant="secondary"
              size="sm"
              label={`${translate('habits:habits.list.sort.toggleDirection')} (${sortedLabel})`}
              title={sortedLabel}
              onClick={onToggleSortDirection}
            />
          </div>
        </div>
      </div>

      <div className="lm-habit-list__rows">{renderRows()}</div>

      {status === 'ready' && data ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={rangeLabel(data)} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

export default HabitList
