import { createContext } from 'react'

export interface LoginTransitionContextValue {
  /**
   * Covers the screen with the helm animation, runs `go` (the navigation) under the cover and, once the new screen
   * is painted and the helm sparkles, opens the cover in a circle over it (or fades it out); resolves as the cover
   * opens, within `MAX_PLAY_MS` (3 s) at most. With reduced motion it shows nothing: it runs `go` and resolves
   * `false`.
   */
  play: (label: string, go: () => void | Promise<void>) => Promise<boolean>
}

export const LoginTransitionContext = createContext<LoginTransitionContextValue | null>(null)
