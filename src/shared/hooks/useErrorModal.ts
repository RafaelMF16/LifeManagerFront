import { useContext } from 'react'
import { ErrorModalContext } from '../components/ErrorModal/ErrorModalContext'

export function useErrorModal() {
  const context = useContext(ErrorModalContext)

  if (!context) {
    throw new Error('useErrorModal must be used within an ErrorModalProvider')
  }

  return context
}
