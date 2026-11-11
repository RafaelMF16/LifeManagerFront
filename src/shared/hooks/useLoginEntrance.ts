import { useState } from 'react'
import { entranceClass } from '../utils/loginEntrance'
import { useLoginTransition } from './useLoginTransition'

/**
 * The class for a screen's root when it may be where a sign-in lands (`shared/styles/enter.css`): its
 * `[data-enter]` blocks stay hidden under the sign-in cover and arrive in turn as it opens. Whether the screen came
 * from the sign-in is read once, on mount, so a reload or a later visit plays nothing.
 */
export function useLoginEntrance(): string {
  const { entrance } = useLoginTransition()
  const [fromLogin] = useState(() => entrance !== null)
  return entranceClass(fromLogin, entrance)
}
