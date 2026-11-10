import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import type { IconName } from '../../../shared/components/Icon/Icon'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  confirmIcon: IconName
  onClose: () => void
  /** The action; the dialog shows it running and the caller closes it or shows the failure. */
  onConfirm: () => Promise<void>
}

/** Confirms an action of "My account" that can't be taken back from here (sign out of all devices). */
function ConfirmDialog({ title, message, confirmLabel, confirmIcon, onClose, onConfirm }: ConfirmDialogProps) {
  const { t: translate } = useTranslation('account')
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
          {translate('account:actions.cancel')}
        </Button>
        <Button variant="destructive" icon={confirmIcon} loading={busy} onClick={() => void confirm()}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}

export default ConfirmDialog
