import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import Icon from '../../../shared/components/Icon/Icon'
import type { GameItemDto } from '../../types/GameItemDtos'
import type { PlayerProfileDto } from '../../types/PlayerProfileDtos'
import { gameItemEffect, gameItemIcon, gameItemName, hpHealedNow } from '../../utils/gameItems'
import '../ShopDialog.css'

interface PurchaseItemDialogProps {
  item: GameItemDto
  /** Undefined while the profile loads: the "after" lines are left out. */
  profile: PlayerProfileDto | undefined
  onClose: () => void
  /** Buys it; the dialog stays open, with its button loading, until it settles. */
  onConfirm: () => Promise<void>
}

/** Confirms buying a game item: the price, the balance left and what the item changes (HP or freezes). */
function PurchaseItemDialog({ item, profile, onClose, onConfirm }: PurchaseItemDialogProps) {
  const { t: translate } = useTranslation('habits')
  const titleId = useId()
  const [buying, setBuying] = useState(false)
  const healed = hpHealedNow(item, profile)

  async function confirm() {
    setBuying(true)
    try {
      await onConfirm()
    } finally {
      setBuying(false)
    }
  }

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__header">
        <h2 id={titleId} className="lm-dialog__title">
          {translate('habits:shop.items.purchase.title')}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <div className="lm-redeem-dialog__reward">
          <span className="lm-redeem-dialog__icon" aria-hidden="true">
            <Icon name={gameItemIcon(item.kind)} size={20} />
          </span>
          <span className="lm-redeem-dialog__name">
            {gameItemName(item.kind, translate)} · {gameItemEffect(item, translate)}
          </span>
        </div>
        <dl className="lm-redeem-dialog__summary">
          <div className="lm-redeem-dialog__line">
            <dt>{translate('habits:shop.redeem.cost')}</dt>
            <dd>{translate('habits:shop.list.price', { count: item.price })}</dd>
          </div>
          {profile ? (
            <>
              <div className="lm-redeem-dialog__line">
                <dt>{translate('habits:shop.redeem.balanceAfter')}</dt>
                <dd>{translate('habits:shop.list.price', { count: Math.max(profile.coins - item.price, 0) })}</dd>
              </div>
              {item.hpRestore !== null ? (
                <div className="lm-redeem-dialog__line">
                  <dt>{translate('habits:shop.items.purchase.hpAfter')}</dt>
                  <dd>
                    {profile.hp + healed} / {profile.maxHp}
                  </dd>
                </div>
              ) : (
                <div className="lm-redeem-dialog__line">
                  <dt>{translate('habits:shop.items.purchase.freezesAfter')}</dt>
                  <dd>
                    {Math.min(profile.streakFreezes + 1, profile.maxStreakFreezes)} / {profile.maxStreakFreezes}
                  </dd>
                </div>
              )}
            </>
          ) : null}
        </dl>
        {item.hpRestore !== null && profile && healed < item.hpRestore ? (
          <p className="lm-redeem-dialog__note">{translate('habits:shop.items.purchase.partialHeal', { count: healed })}</p>
        ) : null}
        <p className="lm-redeem-dialog__note">{translate('habits:shop.items.purchase.note')}</p>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('habits:actions.cancel')}
        </Button>
        <Button variant="primary" icon="coins" loading={buying} onClick={() => void confirm()}>
          {translate('habits:shop.items.purchase.confirm', { count: item.price })}
        </Button>
      </div>
    </Dialog>
  )
}

export default PurchaseItemDialog
