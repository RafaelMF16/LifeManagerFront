import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import type { SavingsGoalResponseDto } from '../../types/SavingsGoalDtos'

interface ArchiveSavingsGoalModalProps {
  goal: SavingsGoalResponseDto
  onClose: () => void
  onConfirm: () => Promise<void>
}

/** Archiving keeps the goal's history and its linked transactions; it can be restored later. */
function ArchiveSavingsGoalModal({ goal, onClose, onConfirm }: ArchiveSavingsGoalModalProps) {
  const { t: translate } = useTranslation('finance')
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
          {translate('finance:savingsGoals.archive.title')}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <p className="lm-dialog__message">{translate('finance:savingsGoals.archive.message', { name: goal.name })}</p>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('finance:actions.cancel')}
        </Button>
        <Button variant="primary" icon="archive" loading={archiving} onClick={() => void confirm()}>
          {translate('finance:savingsGoals.archive.confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

export default ArchiveSavingsGoalModal
