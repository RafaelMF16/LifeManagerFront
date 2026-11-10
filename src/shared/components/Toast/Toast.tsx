import Icon from '../Icon/Icon'
import type { ToastAction } from './ToastContext'
import './Toast.css'

interface ToastProps {
  message: string
  detail?: string
  action?: ToastAction
  onClose: () => void
}

function Toast({ message, detail, action, onClose }: ToastProps) {
  return (
    <div role="status" aria-live="polite" className="lm-toast">
      <span className="lm-toast__icon">
        <Icon name="check" size={12} />
      </span>
      <div className="lm-toast__body">
        <span className="lm-toast__message">{message}</span>
        {detail ? <span className="lm-toast__detail">{detail}</span> : null}
      </div>
      {action ? (
        <button
          type="button"
          className="lm-toast__action"
          onClick={() => {
            action.onClick()
            onClose()
          }}
        >
          {action.label}
        </button>
      ) : null}
      <button type="button" onClick={onClose} aria-label="Fechar aviso" className="lm-toast__close">
        <Icon name="x" size={14} />
      </button>
    </div>
  )
}

export default Toast
