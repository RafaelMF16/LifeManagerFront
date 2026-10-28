import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import type { GameItemsStatus } from '../../hooks/useGameItems'
import type { GameItemDto } from '../../types/GameItemDtos'
import type { PlayerProfileDto } from '../../types/PlayerProfileDtos'
import { gameItemBlockedReason, gameItemEffect, gameItemIcon, gameItemName, gameItemUsage } from '../../utils/gameItems'
import './GameItemList.css'

interface GameItemListProps {
  items: GameItemDto[] | undefined
  status: GameItemsStatus
  isFetching: boolean
  /** The outlet context's profile: the newest balance, reloaded after every game action. */
  profile: PlayerProfileDto | undefined
  onRetry: () => void
  onBuy: (item: GameItemDto) => void
}

/** The shop's fixed game items: what each does, its price, how much of its limit is used, and Buy (or why not). */
function GameItemList({ items, status, isFetching, profile, onRetry, onBuy }: GameItemListProps) {
  const { t: translate } = useTranslation('habits')

  function renderBody() {
    if (status === 'loading' || !items) {
      if (status === 'error') {
        return (
          <div className="lm-game-item-list__state">
            {translate('habits:shop.items.loadError')}
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {translate('habits:shop.items.retry')}
            </Button>
          </div>
        )
      }
      return <div className="lm-game-item-list__state">{translate('habits:shop.items.loading')}</div>
    }

    return (
      <ul className="lm-game-item-list__grid" data-tour="items.cards">
        {items.map((item) => {
          const blocked = gameItemBlockedReason(item, profile, translate)
          return (
            <li key={item.kind} className="lm-game-item-list__card">
              <div className="lm-game-item-list__top">
                <span className={`lm-game-item-list__icon lm-game-item-list__icon--${item.kind}`} aria-hidden="true">
                  <Icon name={gameItemIcon(item.kind)} size={20} />
                </span>
                <div className="lm-game-item-list__info">
                  <span className="lm-game-item-list__name">{gameItemName(item.kind, translate)}</span>
                  <span className="lm-game-item-list__effect">{gameItemEffect(item, translate)}</span>
                  <span className="lm-game-item-list__description">
                    {translate(`habits:shop.items.descriptions.${item.kind}`)}
                  </span>
                </div>
              </div>

              <div className="lm-game-item-list__meta">
                <span className="lm-game-item-list__price">
                  <Icon name="coins" size={14} aria-hidden="true" />
                  {translate('habits:shop.list.price', { count: item.price })}
                </span>
                <span className="lm-game-item-list__usage">{gameItemUsage(item, translate)}</span>
              </div>

              <Button
                variant={blocked ? 'secondary' : 'primary'}
                size="sm"
                icon={blocked ? undefined : 'coins'}
                disabled={blocked !== null}
                onClick={() => onBuy(item)}
              >
                {blocked ?? translate('habits:shop.items.buy')}
              </Button>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <section className={`lm-game-item-list${isFetching && status === 'ready' ? ' lm-game-item-list--fetching' : ''}`}>
      <div className="lm-game-item-list__heading">
        <h2 className="lm-game-item-list__title">{translate('habits:shop.items.title')}</h2>
        <p className="lm-game-item-list__hint">{translate('habits:shop.items.hint')}</p>
      </div>
      <div className="lm-game-item-list__body">{renderBody()}</div>
    </section>
  )
}

export default GameItemList
