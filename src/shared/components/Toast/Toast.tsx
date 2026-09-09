import Icon from '../Icon/Icon'
import './Toast.css'

interface ToastProps {
  message: string
  detail?: string
  onClose: () => void
}

function Toast({ message, detail, onClose }: ToastProps) {
  return (
    <div role="status" aria-live="polite" className="lm-toast">
      <span className="lm-toast__icon">
        <Icon name="check" size={12} />
      </span>
      <div className="lm-toast__body">
        <span className="lm-toast__message">{message}</span>
        {detail ? <span className="lm-toast__detail">{detail}</span> : null}
      </div>
      <button type="button" onClick={onClose} aria-label="Fechar aviso" className="lm-toast__close">
        <Icon name="x" size={14} />
      </button>
    </div>
  )
}

export default Toast
