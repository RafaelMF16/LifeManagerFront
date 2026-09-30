import { useId } from 'react'
import Button from '../Button/Button'
import Dialog from '../Dialog/Dialog'
import Icon from '../Icon/Icon'
import './ErrorModal.css'

interface ErrorModalProps {
  title: string
  message: string
  onClose: () => void
}

function ErrorModal({ title, message, onClose }: ErrorModalProps) {
  const titleId = useId()

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onClose}>
      <div className="lm-error-modal__header">
        <span className="lm-error-modal__icon">
          <Icon name="x" size={18} />
        </span>
        <div className="lm-error-modal__text">
          <h2 id={titleId} className="lm-dialog__title">
            {title}
          </h2>
          <p className="lm-dialog__message">{message}</p>
        </div>
      </div>
      <div className="lm-dialog__footer">
        <Button variant="primary" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Dialog>
  )
}

export default ErrorModal
