import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import type { RewardResponseDto } from '../../types/RewardDtos'

interface ArchiveRewardModalProps {
  reward: RewardResponseDto
  onClose: () => void
  onConfirm: () => Promise<void>
}

/** Confirms archiving, which is what "delete" means for a reward: its redemptions stay and it can be restored. */
function ArchiveRewardModal({ reward, onClose, onConfirm }: ArchiveRewardModalProps) {
  const { t: translate } = useTranslation('habits')
  const titleId = useId()
  const [archiving, setArchiving] = useState(false)

  async function confirm() {
    setArchiving(true)
    try {
      await onConfirm()
    } finally {
      setArchiving(false)
    }
  }

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__header">
        <h2 id={titleId} className="lm-dialog__title">
          {translate('habits:shop.archive.title')}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <p className="lm-dialog__message">{translate('habits:shop.archive.message', { name: reward.name })}</p>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('habits:actions.cancel')}
        </Button>
        <Button variant="destructive" icon="archive" loading={archiving} onClick={() => void confirm()}>
          {translate('habits:shop.archive.confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

export default ArchiveRewardModal
