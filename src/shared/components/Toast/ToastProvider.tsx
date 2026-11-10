import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Toast from './Toast'
import { ToastContext } from './ToastContext'
import type { ToastAction, ToastOptions } from './ToastContext'

interface ToastState {
  message: string
  detail?: string
  action?: ToastAction
}

const AUTO_DISMISS_MS = 4000
/** A toast with a button stays longer, so there is time to reach it. */
const AUTO_DISMISS_WITH_ACTION_MS = 8000

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const close = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setToast(null)
  }, [])

  const show = useCallback((message: string, detail?: string, action?: ToastAction, options?: ToastOptions) => {
    clearTimeout(timeoutRef.current)
    setToast({ message, detail, action })
    if (options?.persistent) return
    timeoutRef.current = setTimeout(() => setToast(null), action ? AUTO_DISMISS_WITH_ACTION_MS : AUTO_DISMISS_MS)
  }, [])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? <Toast message={toast.message} detail={toast.detail} action={toast.action} onClose={close} /> : null}
    </ToastContext.Provider>
  )
}
