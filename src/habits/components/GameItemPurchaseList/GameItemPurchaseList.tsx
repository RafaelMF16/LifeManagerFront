import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import type { GameItemPurchaseDto } from '../../types/GameItemDtos'
import { gameItemIcon, gameItemName } from '../../utils/gameItems'
import './GameItemPurchaseList.css'

interface GameItemPurchaseListProps {
  /** Today's purchases, oldest first, undone ones included. */
  purchases: GameItemPurchaseDto[]
  /** Only offered while the backend's `canUndo` says so (made today, not undone). */
  onUndo: (purchase: GameItemPurchaseDto) => void
  /** The purchase whose undo is in flight, so its button can't be pressed twice. */
  pendingId: number | null
}

/** Today's item purchases: what, when, for how much, and Undo while the day lasts. Hidden when there are none. */
function GameItemPurchaseList({ purchases, onUndo, pendingId }: GameItemPurchaseListProps) {
  const { t: translate, i18n } = useTranslation('habits')
  const timeFormat = new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' })

  if (purchases.length === 0) return null

  function renderStatus(purchase: GameItemPurchaseDto) {
    if (purchase.isUndone) {
      return <span className="lm-item-purchase-list__badge">{translate('habits:shop.items.today.undone')}</span>
    }

    if (!purchase.canUndo) return null

    return (
      <Button
        variant="secondary"
        size="sm"
        icon="undo-2"
        disabled={pendingId === purchase.id}
        onClick={() => onUndo(purchase)}
        aria-label={translate('habits:shop.items.today.undoAria', { name: gameItemName(purchase.kind, translate) })}
        data-tour="items.undo"
      >
        {translate('habits:shop.items.today.undo')}
      </Button>
    )
  }

  return (
    <section className="lm-item-purchase-list">
      <div className="lm-item-purchase-list__toolbar">
        <h2 className="lm-item-purchase-list__title">{translate('habits:shop.items.today.title')}</h2>
        <span className="lm-item-purchase-list__hint">{translate('habits:shop.items.today.hint')}</span>
      </div>

      <ul className="lm-item-purchase-list__rows">
        {purchases.map((purchase) => (
          <li
            key={purchase.id}
            className={`lm-item-purchase-list__row${purchase.isUndone ? ' lm-item-purchase-list__row--undone' : ''}`}
          >
            <span className="lm-item-purchase-list__icon" aria-hidden="true">
              <Icon name={gameItemIcon(purchase.kind)} size={16} />
            </span>
            <div className="lm-item-purchase-list__main">
              <span className="lm-item-purchase-list__name">
                {gameItemName(purchase.kind, translate)}
                {purchase.hpRestored > 0 ? ` · ${translate('habits:shop.items.effects.hp', { count: purchase.hpRestored })}` : ''}
              </span>
              <time className="lm-item-purchase-list__when" dateTime={purchase.purchasedAt}>
                {timeFormat.format(new Date(purchase.purchasedAt))}
              </time>
            </div>
            <span className="lm-item-purchase-list__cost">
              {translate('habits:shop.redemptions.cost', { count: purchase.costPaid })}
            </span>
            <div className="lm-item-purchase-list__status">{renderStatus(purchase)}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default GameItemPurchaseList
