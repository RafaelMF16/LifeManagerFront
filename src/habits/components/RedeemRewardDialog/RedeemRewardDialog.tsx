import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import Icon from '../../../shared/components/Icon/Icon'
import type { RewardResponseDto } from '../../types/RewardDtos'
import { rewardIcon } from '../../utils/rewardIcons'
import './RedeemRewardDialog.css'

interface RedeemRewardDialogProps {
  reward: RewardResponseDto
  /** The balance now; undefined while the profile loads. */
  coins: number | undefined
  onClose: () => void
  /** Redeems it; the dialog stays open, with its button loading, until it settles. */
  onConfirm: () => Promise<void>
}

/** Confirms spending coins on a reward, showing the balance left after it. */
function RedeemRewardDialog({ reward, coins, onClose, onConfirm }: RedeemRewardDialogProps) {
  const { t: translate } = useTranslation('habits')
  const titleId = useId()
  const [redeeming, setRedeeming] = useState(false)

  async function confirm() {
    setRedeeming(true)
    try {
      await onConfirm()
    } finally {
      setRedeeming(false)
    }
  }

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__header">
        <h2 id={titleId} className="lm-dialog__title">
          {translate('habits:shop.redeem.title')}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <div className="lm-redeem-dialog__reward">
          <span className="lm-redeem-dialog__icon" aria-hidden="true">
            <Icon name={rewardIcon(reward.icon)} size={20} />
          </span>
          <span className="lm-redeem-dialog__name">{reward.name}</span>
        </div>
        <dl className="lm-redeem-dialog__summary">
          <div className="lm-redeem-dialog__line">
            <dt>{translate('habits:shop.redeem.cost')}</dt>
            <dd>{translate('habits:shop.list.price', { count: reward.cost })}</dd>
          </div>
          {coins !== undefined ? (
            <div className="lm-redeem-dialog__line">
              <dt>{translate('habits:shop.redeem.balanceAfter')}</dt>
              <dd>{translate('habits:shop.list.price', { count: Math.max(coins - reward.cost, 0) })}</dd>
            </div>
          ) : null}
        </dl>
        <p className="lm-redeem-dialog__note">{translate('habits:shop.redeem.note')}</p>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('habits:actions.cancel')}
        </Button>
        <Button variant="primary" icon="coins" loading={redeeming} onClick={() => void confirm()}>
          {translate('habits:shop.redeem.confirm', { count: reward.cost })}
        </Button>
      </div>
    </Dialog>
  )
}

export default RedeemRewardDialog
