import { createContext } from 'react'

export interface ErrorModalContextValue {
  show: (title: string, message: string) => void
}

export const ErrorModalContext = createContext<ErrorModalContextValue | null>(null)
