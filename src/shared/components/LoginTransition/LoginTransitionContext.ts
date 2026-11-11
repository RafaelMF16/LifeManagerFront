import { createContext } from 'react'
import type { LoginEntrance } from '../../utils/loginEntrance'

export interface LoginTransitionContextValue {
  /**
   * Covers the screen with the helm animation, runs `go` (the navigation) under the cover and, once the new screen
   * is painted and the helm sparkles, opens the cover in a circle over it (or fades it out); resolves as the cover
   * opens, within `MAX_PLAY_MS` (3 s) at most. With reduced motion it shows nothing: it runs `go` and resolves
   * `false`.
   */
  play: (label: string, go: () => void | Promise<void>) => Promise<boolean>
  /** Where the cover is, for the screen underneath (`useLoginEntrance`). */
  entrance: LoginEntrance
}

export const LoginTransitionContext = createContext<LoginTransitionContextValue | null>(null)
