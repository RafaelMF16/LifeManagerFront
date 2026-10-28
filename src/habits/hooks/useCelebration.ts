import { useCallback, useEffect, useRef, useState } from 'react'

/** How long a check-in celebration (the box's pop and the floating coins) stays on. */
const CELEBRATION_MS = 700

export interface Celebration {
  /** New on every celebration, so a quick undo and redo replays the animation. */
  key: number
  coins: number
}

/** A celebration that switches itself off after the animation. */
export function useCelebration() {
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const celebrate = useCallback((coins: number) => {
    window.clearTimeout(timeoutRef.current)
    setCelebration({ key: Date.now(), coins })
    timeoutRef.current = window.setTimeout(() => setCelebration(null), CELEBRATION_MS)
  }, [])

  return { celebration, celebrate }
}
