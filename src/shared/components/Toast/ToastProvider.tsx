import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Toast from './Toast'
import { ToastContext } from './ToastContext'

interface ToastState {
  message: string
  detail?: string
}

const AUTO_DISMISS_MS = 4000

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

  const show = useCallback((message: string, detail?: string) => {
    clearTimeout(timeoutRef.current)
    setToast({ message, detail })
    timeoutRef.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS)
  }, [])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? <Toast message={toast.message} detail={toast.detail} onClose={close} /> : null}
    </ToastContext.Provider>
  )
}
