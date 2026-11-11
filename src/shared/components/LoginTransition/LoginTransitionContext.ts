import { createContext } from 'react'

export interface LoginTransitionContextValue {
  /**
   * Covers the screen with the helm animation and resolves once it has played (within 2 s at most), so the caller
   * navigates under the cover; the cover then fades out over the new screen. Resolves `false` right away, showing
   * nothing, when the user prefers reduced motion.
   */
  play: (label: string) => Promise<boolean>
}

export const LoginTransitionContext = createContext<LoginTransitionContextValue | null>(null)
