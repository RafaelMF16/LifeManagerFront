import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import type { StatementImportResponseDto } from '../../types/StatementImportDtos'

interface DeleteImportDialogProps {
  statementImport: StatementImportResponseDto
  onClose: () => void
  onConfirm: () => Promise<void>
}

/** Discards a draft (nothing was posted yet), or removes a confirmed import from the history (its transactions stay). */
function DeleteImportDialog({ statementImport, onClose, onConfirm }: DeleteImportDialogProps) {
  const { t: translate } = useTranslation('finance')
  const titleId = useId()
  const [deleting, setDeleting] = useState(false)
  const draft = statementImport.status === 'Draft'
  const prefix = draft ? 'finance:imports.delete.discard' : 'finance:imports.delete.remove'

  async function confirm() {
    setDeleting(true)
    try {
      await onConfirm()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__header">
        <h2 id={titleId} className="lm-dialog__title">
          {translate(`${prefix}Title`)}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <p className="lm-dialog__message">
          {translate(`${prefix}Message`, { fileName: statementImport.fileName, count: statementImport.rowCount })}
        </p>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('finance:actions.cancel')}
        </Button>
        <Button variant="destructive" icon={draft ? 'trash-2' : 'x'} loading={deleting} onClick={() => void confirm()}>
          {translate(`${prefix}Confirm`)}
        </Button>
      </div>
    </Dialog>
  )
}

export default DeleteImportDialog
