import { useEffect } from 'react'
import type { ReactNode } from 'react'
import './Dialog.css'

interface DialogProps {
  onClose: () => void
  role?: 'dialog' | 'alertdialog'
  labelledBy?: string
  className?: string
  children: ReactNode
}

/** Modal shell (scrim + panel): closes on Escape and on a click that starts on the scrim. */
function Dialog({ onClose, role = 'dialog', labelledBy, className, children }: DialogProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="lm-dialog__scrim"
      onMouseDown={(event) => {
        // mousedown (not click) so a text selection dragged out of an input doesn't close the dialog.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={['lm-dialog', className].filter(Boolean).join(' ')}
      >
        {children}
      </div>
    </div>
  )
}

export default Dialog
