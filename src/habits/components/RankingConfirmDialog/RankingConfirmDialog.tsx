import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import type { IconName } from '../../../shared/components/Icon/Icon'

interface RankingConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  confirmIcon: IconName
  /** Destructive for leaving or removing; primary for a new invite code. */
  variant?: 'destructive' | 'primary'
  onClose: () => void
  onConfirm: () => Promise<void>
}

/** Confirms a group action that can't be taken back from here: leaving, removing someone, a new invite code. */
function RankingConfirmDialog({ title, message, confirmLabel, confirmIcon, variant = 'destructive', onClose, onConfirm }: RankingConfirmDialogProps) {
  const { t: translate } = useTranslation('habits')
  const titleId = useId()
  const [busy, setBusy] = useState(false)

  async function confirm() {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__header">
        <h2 id={titleId} className="lm-dialog__title">
          {title}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <p className="lm-dialog__message">{message}</p>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('habits:actions.cancel')}
        </Button>
        <Button variant={variant} icon={confirmIcon} loading={busy} onClick={() => void confirm()}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}

export default RankingConfirmDialog
