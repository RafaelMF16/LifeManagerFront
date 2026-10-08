import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import type { HabitResponseDto } from '../../types/HabitDtos'

interface ArchiveHabitModalProps {
  habit: HabitResponseDto
  onClose: () => void
  onConfirm: () => Promise<void>
}

/** Confirms archiving, which is what "delete" means for a habit: its history stays and it can be restored. */
function ArchiveHabitModal({ habit, onClose, onConfirm }: ArchiveHabitModalProps) {
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
          {translate('habits:habits.archive.title')}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <p className="lm-dialog__message">{translate('habits:habits.archive.message', { name: habit.name })}</p>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('habits:actions.cancel')}
        </Button>
        <Button variant="destructive" icon="archive" loading={archiving} onClick={() => void confirm()}>
          {translate('habits:habits.archive.confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

export default ArchiveHabitModal
