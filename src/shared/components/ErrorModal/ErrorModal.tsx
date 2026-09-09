import { useEffect, useId } from 'react'
import Button from '../Button/Button'
import Icon from '../Icon/Icon'
import './ErrorModal.css'

interface ErrorModalProps {
  title: string
  message: string
  onClose: () => void
}

function ErrorModal({ title, message, onClose }: ErrorModalProps) {
  const titleId = useId()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="lm-error-modal__scrim" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="lm-error-modal"
      >
        <div className="lm-error-modal__header">
          <span className="lm-error-modal__icon">
            <Icon name="x" size={18} />
          </span>
          <div className="lm-error-modal__text">
            <h2 id={titleId} className="lm-error-modal__title">
              {title}
            </h2>
            <p className="lm-error-modal__message">{message}</p>
          </div>
        </div>
        <div className="lm-error-modal__footer">
          <Button variant="primary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ErrorModal
