import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import ErrorModal from './ErrorModal'
import { ErrorModalContext } from './ErrorModalContext'

interface ErrorModalState {
  title: string
  message: string
}

interface ErrorModalProviderProps {
  children: ReactNode
}

export function ErrorModalProvider({ children }: ErrorModalProviderProps) {
  const [error, setError] = useState<ErrorModalState | null>(null)

  const close = useCallback(() => setError(null), [])

  const show = useCallback((title: string, message: string) => {
    setError({ title, message })
  }, [])

  return (
    <ErrorModalContext.Provider value={{ show }}>
      {children}
      {error ? <ErrorModal title={error.title} message={error.message} onClose={close} /> : null}
    </ErrorModalContext.Provider>
  )
}
