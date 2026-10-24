import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'

interface LeaveBudgetDialogProps {
  /** "Outubro 2026": the month whose changes would be lost. */
  period: string
  onStay: () => void
  onLeave: () => void
}

/** Asked before leaving the budget (another screen or another month) with changes that aren't saved. */
function LeaveBudgetDialog({ period, onStay, onLeave }: LeaveBudgetDialogProps) {
  const { t: translate } = useTranslation('finance')
  const titleId = useId()

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onStay}>
      <div className="lm-dialog__header">
        <h2 id={titleId} className="lm-dialog__title">
          {translate('finance:budgetPlan.leave.title')}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <p className="lm-dialog__message">{translate('finance:budgetPlan.leave.message', { period })}</p>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onStay} autoFocus>
          {translate('finance:budgetPlan.leave.stay')}
        </Button>
        <Button variant="destructive" onClick={onLeave}>
          {translate('finance:budgetPlan.leave.leave')}
        </Button>
      </div>
    </Dialog>
  )
}

export default LeaveBudgetDialog
