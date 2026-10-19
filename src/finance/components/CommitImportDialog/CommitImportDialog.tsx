import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import type { StatementImportDetailsDto } from '../../types/StatementImportDtos'

interface CommitImportDialogProps {
  statementImport: StatementImportDetailsDto
  onClose: () => void
  onConfirm: () => Promise<void>
}

/** The last look before posting: how many transactions, into how many months, and how many months are new. */
function CommitImportDialog({ statementImport, onClose, onConfirm }: CommitImportDialogProps) {
  const { t: translate } = useTranslation('finance')
  const titleId = useId()
  const [committing, setCommitting] = useState(false)

  const monthsWithLines = statementImport.months.filter((month) => month.includedCount > 0)
  const newMonthCount = monthsWithLines.filter((month) => month.monthlySummaryId === null).length

  async function confirm() {
    setCommitting(true)
    try {
      await onConfirm()
    } finally {
      setCommitting(false)
    }
  }

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__header">
        <h2 id={titleId} className="lm-dialog__title">
          {translate('finance:imports.commit.title')}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <p className="lm-dialog__message">
          {translate('finance:imports.commit.transactions', { count: statementImport.includedCount })}{' '}
          {translate('finance:imports.commit.months', { count: monthsWithLines.length })}
        </p>
        {newMonthCount > 0 ? (
          <p className="lm-dialog__message">{translate('finance:imports.commit.newMonths', { count: newMonthCount })}</p>
        ) : null}
        <p className="lm-dialog__message">{translate('finance:imports.commit.learning')}</p>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('finance:actions.cancel')}
        </Button>
        <Button variant="primary" icon="check" loading={committing} onClick={() => void confirm()}>
          {translate('finance:imports.commit.confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

export default CommitImportDialog
