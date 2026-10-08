import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import Pagination from '../../../shared/components/Pagination/Pagination'
import type { PagedResponse } from '../../../shared/types/Paging'
import type { RedemptionsStatus } from '../../hooks/useRedemptions'
import type { RewardRedemptionDto } from '../../types/RewardDtos'
import { rewardIcon } from '../../utils/rewardIcons'
import './RedemptionList.css'

interface RedemptionListProps {
  data: PagedResponse<RewardRedemptionDto> | undefined
  status: RedemptionsStatus
  isFetching: boolean
  onPageChange: (page: number) => void
  onRetry: () => void
  /** Only offered on today's redemptions not undone yet (`canUndo`, decided by the backend). */
  onUndo: (redemption: RewardRedemptionDto) => void
  /** The redemption whose undo is in flight, so its button can't be pressed twice. */
  pendingId: number | null
}

/** Every reward redeemed, newest first: what, when and for how much; today's ones can be undone. */
function RedemptionList({ data, status, isFetching, onPageChange, onRetry, onUndo, pendingId }: RedemptionListProps) {
  const { t: translate, i18n } = useTranslation('habits')
  const dateFormat = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  function renderStatus(redemption: RewardRedemptionDto) {
    if (redemption.undoneAt) {
      return <span className="lm-redemption-list__badge">{translate('habits:shop.redemptions.undone')}</span>
    }

    if (!redemption.canUndo) return null

    return (
      <Button
        variant="secondary"
        size="sm"
        icon="undo-2"
        disabled={pendingId === redemption.id}
        onClick={() => onUndo(redemption)}
        aria-label={translate('habits:shop.redemptions.undoAria', { name: redemption.rewardName })}
      >
        {translate('habits:shop.redemptions.undo')}
      </Button>
    )
  }

  function renderRows() {
    if (status === 'loading') {
      return <div className="lm-redemption-list__state">{translate('habits:shop.redemptions.loading')}</div>
    }

    if (status === 'error' || !data) {
      return (
        <div className="lm-redemption-list__state">
          <span>{translate('habits:shop.redemptions.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {translate('habits:shop.list.retry')}
          </Button>
        </div>
      )
    }

    if (data.totalCount === 0) {
      return (
        <div className="lm-redemption-list__state">
          <span className="lm-redemption-list__state-title">{translate('habits:shop.redemptions.empty')}</span>
          <span>{translate('habits:shop.redemptions.emptyHint')}</span>
        </div>
      )
    }

    return (
      <ul className="lm-redemption-list__rows">
        {data.items.map((redemption) => (
          <li
            key={redemption.id}
            className={`lm-redemption-list__row${redemption.undoneAt ? ' lm-redemption-list__row--undone' : ''}`}
          >
            <span className="lm-redemption-list__icon" aria-hidden="true">
              <Icon name={rewardIcon(redemption.rewardIcon)} size={16} />
            </span>
            <div className="lm-redemption-list__main">
              <span className="lm-redemption-list__name">{redemption.rewardName}</span>
              <time className="lm-redemption-list__when" dateTime={redemption.redeemedAt}>
                {dateFormat.format(new Date(redemption.redeemedAt))}
              </time>
            </div>
            <span className="lm-redemption-list__cost">
              {translate('habits:shop.redemptions.cost', { count: redemption.costPaid })}
            </span>
            <div className="lm-redemption-list__status">{renderStatus(redemption)}</div>
          </li>
        ))}
      </ul>
    )
  }

  function rangeLabel(page: PagedResponse<RewardRedemptionDto>) {
    const from = (page.page - 1) * page.pageSize + 1
    return translate('habits:shop.redemptions.range', { from, to: from + page.items.length - 1, count: page.totalCount })
  }

  return (
    <section
      className={`lm-redemption-list${isFetching && status === 'ready' ? ' lm-redemption-list--fetching' : ''}`}
      aria-busy={isFetching}
    >
      <div className="lm-redemption-list__toolbar">
        <h2 className="lm-redemption-list__title">{translate('habits:shop.redemptions.title')}</h2>
        <span className="lm-redemption-list__hint">{translate('habits:shop.redemptions.hint')}</span>
      </div>

      <div className="lm-redemption-list__body">{renderRows()}</div>

      {status === 'ready' && data && data.totalCount > 0 ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={rangeLabel(data)} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

export default RedemptionList
