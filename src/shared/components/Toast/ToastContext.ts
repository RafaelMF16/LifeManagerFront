import { createContext } from 'react'

export interface ToastContextValue {
  show: (message: string, detail?: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
