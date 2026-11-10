import { createContext } from 'react'

/** A button in the toast (e.g. "View month"); clicking it also closes the toast. */
export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastContextValue {
  show: (message: string, detail?: string, action?: ToastAction) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
