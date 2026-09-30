import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import type { CategoryResponseDto } from '../../types/CategoryDtos'

interface DeleteCategoryModalProps {
  category: CategoryResponseDto
  onClose: () => void
  onConfirm: () => Promise<void>
}

function DeleteCategoryModal({ category, onClose, onConfirm }: DeleteCategoryModalProps) {
  const { t: translate } = useTranslation('finance')
  const titleId = useId()
  const [deleting, setDeleting] = useState(false)

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
          {translate('finance:categories.delete.title')}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <p className="lm-dialog__message">{translate('finance:categories.delete.message', { name: category.name })}</p>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('finance:actions.cancel')}
        </Button>
        <Button variant="destructive" icon="trash-2" loading={deleting} onClick={() => void confirm()}>
          {translate('finance:categories.delete.confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

export default DeleteCategoryModal
