import { createContext } from 'react'

/** A button in the toast (e.g. "View month"); clicking it also closes the toast. */
export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  /** Stays until the user closes it or clicks its action (e.g. "New version available"); a timed toast shows over it
   * and it comes back afterwards (`toastStack.ts`). */
  persistent?: boolean
}

export interface ToastContextValue {
  show: (message: string, detail?: string, action?: ToastAction, options?: ToastOptions) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
