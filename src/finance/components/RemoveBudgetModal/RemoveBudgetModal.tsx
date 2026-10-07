import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'

interface RemoveBudgetModalProps {
  /** The category's name, or "month total". */
  name: string
  /** "Outubro 2026": the goal is removed from this month on. */
  period: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

function RemoveBudgetModal({ name, period, onClose, onConfirm }: RemoveBudgetModalProps) {
  const { t: translate } = useTranslation('finance')
  const titleId = useId()
  const [removing, setRemoving] = useState(false)

  async function confirm() {
    setRemoving(true)
    try {
      await onConfirm()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__header">
        <h2 id={titleId} className="lm-dialog__title">
          {translate('finance:budgets.removeDialog.title')}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <p className="lm-dialog__message">{translate('finance:budgets.removeDialog.message', { name, period })}</p>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('finance:actions.cancel')}
        </Button>
        <Button variant="destructive" icon="trash-2" loading={removing} onClick={() => void confirm()}>
          {translate('finance:budgets.removeDialog.confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

export default RemoveBudgetModal
