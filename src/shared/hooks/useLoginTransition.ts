import { useContext } from 'react'
import { LoginTransitionContext } from '../components/LoginTransition/LoginTransitionContext'

export function useLoginTransition() {
  const context = useContext(LoginTransitionContext)

  if (!context) {
    throw new Error('useLoginTransition must be used within a LoginTransitionProvider')
  }

  return context
}
