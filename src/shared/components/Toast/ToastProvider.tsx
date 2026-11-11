import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Toast from './Toast'
import { ToastContext } from './ToastContext'
import type { ToastAction, ToastOptions } from './ToastContext'
import { closeVisibleToast, EMPTY_TOAST_STACK, expireTransientToast, showToast, visibleToast } from './toastStack'

const AUTO_DISMISS_MS = 4000
/** A toast with a button stays longer, so there is time to reach it. */
const AUTO_DISMISS_WITH_ACTION_MS = 8000

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [stack, setStack] = useState(EMPTY_TOAST_STACK)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const close = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setStack(closeVisibleToast)
  }, [])

  const show = useCallback((message: string, detail?: string, action?: ToastAction, options?: ToastOptions) => {
    const persistent = options?.persistent === true
    clearTimeout(timeoutRef.current)
    setStack((current) => showToast(current, { message, detail, action }, persistent))
    if (persistent) return
    timeoutRef.current = setTimeout(
      () => setStack(expireTransientToast),
      action ? AUTO_DISMISS_WITH_ACTION_MS : AUTO_DISMISS_MS,
    )
  }, [])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const toast = visibleToast(stack)

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? <Toast message={toast.message} detail={toast.detail} action={toast.action} onClose={close} /> : null}
    </ToastContext.Provider>
  )
}
