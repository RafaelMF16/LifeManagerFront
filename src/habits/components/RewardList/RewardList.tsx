import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import Pagination from '../../../shared/components/Pagination/Pagination'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import Select from '../../../shared/components/Select/Select'
import type { PagedResponse, SortDirection } from '../../../shared/types/Paging'
import type { RewardsStatus } from '../../hooks/useRewards'
import type { RewardResponseDto, RewardSortBy, RewardStatusFilter } from '../../types/RewardDtos'
import { rewardIcon } from '../../utils/rewardIcons'
import { coinsMissing, daysOfHabits } from '../../utils/rewardPace'
import { REWARD_TEMPLATES } from '../../utils/starterTemplates'
import type { RewardTemplateId } from '../../utils/starterTemplates'
import StarterSuggestions from '../StarterSuggestions/StarterSuggestions'
import './RewardList.css'

const STATUS_FILTERS: RewardStatusFilter[] = ['Active', 'Archived']
const SORT_OPTIONS: RewardSortBy[] = ['Cost', 'Name']

interface RewardListProps {
  /** The current page from the server; kept while the next one loads. */
  data: PagedResponse<RewardResponseDto> | undefined
  status: RewardsStatus
  isFetching: boolean
  statusFilter: RewardStatusFilter
  onStatusFilterChange: (status: RewardStatusFilter) => void
  searchInput: string
  onSearchChange: (value: string) => void
  /** The search applied to `data` — tells "no rewards yet" apart from "no results". */
  appliedSearch: string
  sortBy: RewardSortBy
  sortDirection: SortDirection
  onSortByChange: (sortBy: RewardSortBy) => void
  onToggleSortDirection: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
  /** The player's balance; undefined while the profile loads (redeeming is left to the backend's check then). */
  coins: number | undefined
  /** Recent coins per day, for the "≈ N days of habits" hint; undefined while it loads. */
  averageDailyCoins: number | undefined
  onCreate: () => void
  /** Opens the form filled with a starter reward (offered while the shop is empty). */
  onCreateFromTemplate: (template: RewardTemplateId) => void
  onRedeem: (reward: RewardResponseDto) => void
  onEdit: (reward: RewardResponseDto) => void
  onArchive: (reward: RewardResponseDto) => void
  onRestore: (reward: RewardResponseDto) => void
  /** The reward whose restore is in flight, so its button can't be pressed twice. */
  pendingId: number | null
}

/** The shop: one card per reward with its price, what it costs in days of habits, and the redeem button. */
function RewardList({
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
  coins,
  averageDailyCoins,
  onCreate,
  onCreateFromTemplate,
  onRedeem,
  onEdit,
  onArchive,
  onRestore,
  pendingId,
}: RewardListProps) {
  const { t: translate } = useTranslation('habits')
  const hasSearch = appliedSearch !== ''
  const showingArchived = statusFilter === 'Archived'

  const sortedLabel = translate(
    sortDirection === 'Asc' ? 'habits:shop.list.sort.ascending' : 'habits:shop.list.sort.descending',
  )

  function renderEmpty() {
    if (hasSearch) {
      return <div className="lm-reward-list__state">{translate('habits:shop.list.noResults')}</div>
    }

    if (showingArchived) {
      return <div className="lm-reward-list__state">{translate('habits:shop.list.noArchived')}</div>
    }

    return (
      <div className="lm-reward-list__state">
        <Icon name="gift" size={24} aria-hidden="true" />
        <span className="lm-reward-list__state-title">{translate('habits:shop.list.empty')}</span>
        <span>{translate('habits:shop.list.emptyHint')}</span>
        <StarterSuggestions
          title={translate('habits:onboarding.rewardsTitle')}
          suggestions={REWARD_TEMPLATES.map((template) => ({
            id: template.id,
            icon: template.icon,
            label: translate(`habits:onboarding.rewards.${template.id}`),
            detail: translate('habits:shop.list.price', { count: template.cost }),
          }))}
          onPick={(id) => onCreateFromTemplate(id as RewardTemplateId)}
        />
        <Button variant="secondary" size="sm" icon="plus" onClick={onCreate}>
          {translate('habits:onboarding.ownReward')}
        </Button>
      </div>
    )
  }

  function renderRedeem(reward: RewardResponseDto) {
    const missing = coinsMissing(reward.cost, coins)
    return (
      <Button
        variant={missing > 0 ? 'secondary' : 'primary'}
        size="sm"
        icon="coins"
        disabled={missing > 0}
        onClick={() => onRedeem(reward)}
        className="lm-reward-list__redeem"
      >
        {missing > 0
          ? translate('habits:shop.list.missing', { count: missing })
          : translate('habits:shop.list.redeem')}
      </Button>
    )
  }

  function renderCard(reward: RewardResponseDto) {
    const days = daysOfHabits(reward.cost, averageDailyCoins)
    const archived = reward.archivedAt !== null

    return (
      <li key={reward.id} className={`lm-reward-list__card${archived ? ' lm-reward-list__card--archived' : ''}`}>
        <div className="lm-reward-list__top">
          <span className="lm-reward-list__icon" aria-hidden="true">
            <Icon name={rewardIcon(reward.icon)} size={20} />
          </span>
          <div className="lm-reward-list__info">
            <span className="lm-reward-list__name">{reward.name}</span>
            <span className="lm-reward-list__price">
              <Icon name="coins" size={14} aria-hidden="true" />
              {translate('habits:shop.list.price', { count: reward.cost })}
            </span>
            {days !== null && !archived ? (
              <span className="lm-reward-list__pace">{translate('habits:shop.list.days', { count: days })}</span>
            ) : null}
          </div>
        </div>

        <div className="lm-reward-list__actions">
          {archived ? (
            <Button
              variant="secondary"
              size="sm"
              icon="archive-restore"
              disabled={pendingId === reward.id}
              onClick={() => onRestore(reward)}
              className="lm-reward-list__redeem"
            >
              {translate('habits:shop.list.restore')}
            </Button>
          ) : (
            <>
              {renderRedeem(reward)}
              <IconButton
                icon="pencil"
                size="sm"
                label={translate('habits:shop.list.edit', { name: reward.name })}
                onClick={() => onEdit(reward)}
              />
              <IconButton
                icon="archive"
                size="sm"
                label={translate('habits:shop.list.archive', { name: reward.name })}
                onClick={() => onArchive(reward)}
              />
            </>
          )}
        </div>
      </li>
    )
  }

  function renderBody() {
    if (status === 'loading') {
      return <div className="lm-reward-list__state">{translate('habits:shop.list.loading')}</div>
    }

    if (status === 'error' || !data) {
      return (
        <div className="lm-reward-list__state">
          <span>{translate('habits:shop.list.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {translate('habits:shop.list.retry')}
          </Button>
        </div>
      )
    }

    if (data.totalCount === 0) return renderEmpty()

    return <ul className="lm-reward-list__grid">{data.items.map(renderCard)}</ul>
  }

  function rangeLabel(page: PagedResponse<RewardResponseDto>) {
    if (page.totalCount === 0) return translate('habits:shop.pagination.none')

    const from = (page.page - 1) * page.pageSize + 1
    return translate('habits:shop.pagination.range', { from, to: from + page.items.length - 1, count: page.totalCount })
  }

  return (
    <section
      className={`lm-reward-list${isFetching && status === 'ready' ? ' lm-reward-list--fetching' : ''}`}
      aria-busy={isFetching}
    >
      <div className="lm-reward-list__toolbar">
        <div className="lm-reward-list__heading">
          <h2 className="lm-reward-list__title">{translate('habits:shop.list.title')}</h2>
          {status === 'ready' && data ? (
            <span className="lm-reward-list__count">
              {translate(hasSearch ? 'habits:shop.list.results' : 'habits:shop.list.count', { count: data.totalCount })}
            </span>
          ) : null}
        </div>

        <div className="lm-reward-list__filters">
          <SegmentedControl
            size="md"
            aria-label={translate('habits:shop.list.statusLabel')}
            options={STATUS_FILTERS.map((option) => ({
              value: option,
              label: translate(`habits:shop.list.statusOptions.${option}`),
            }))}
            value={statusFilter}
            onChange={onStatusFilterChange}
            className="lm-reward-list__status"
          />
          <Input
            type="search"
            size="sm"
            icon="search"
            placeholder={translate('habits:shop.list.searchPlaceholder')}
            aria-label={translate('habits:shop.list.searchPlaceholder')}
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            containerClassName="lm-reward-list__search"
          />
          <div className="lm-reward-list__sort">
            <Select
              size="sm"
              aria-label={translate('habits:shop.list.sort.label')}
              options={SORT_OPTIONS.map((option) => ({
                value: option,
                label: translate(`habits:shop.list.sort.options.${option}`),
              }))}
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as RewardSortBy)}
              containerClassName="lm-reward-list__sort-select"
            />
            <IconButton
              icon={sortDirection === 'Asc' ? 'arrow-up-narrow-wide' : 'arrow-down-wide-narrow'}
              variant="secondary"
              size="sm"
              label={`${translate('habits:shop.list.sort.toggleDirection')} (${sortedLabel})`}
              title={sortedLabel}
              onClick={onToggleSortDirection}
            />
          </div>
        </div>
      </div>

      <div className="lm-reward-list__body">{renderBody()}</div>

      {status === 'ready' && data && data.totalCount > 0 ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={rangeLabel(data)} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

export default RewardList
