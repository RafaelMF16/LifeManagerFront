import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../Button/Button'
import Dialog from '../Dialog/Dialog'
import type { IconName } from '../Icon/Icon'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  confirmIcon: IconName
  /** Destructive (the default) for what can't be taken back; primary for a harmless one, e.g. a new invite code. */
  variant?: 'destructive' | 'primary'
  onClose: () => void
  /** The action; the dialog shows it running, and the caller closes it or shows the failure. */
  onConfirm: () => Promise<void>
}

/**
 * Asks before an action that can't be undone from where it starts: leaving a ranking group, removing a member, giving
 * up a challenge, signing out of every device. An `alertdialog` with the message and Cancel / the action.
 */
function ConfirmDialog({ title, message, confirmLabel, confirmIcon, variant = 'destructive', onClose, onConfirm }: ConfirmDialogProps) {
  const { t: translate } = useTranslation('common')
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
          {translate('common:actions.cancel')}
        </Button>
        <Button variant={variant} icon={confirmIcon} loading={busy} onClick={() => void confirm()}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}

export default ConfirmDialog
