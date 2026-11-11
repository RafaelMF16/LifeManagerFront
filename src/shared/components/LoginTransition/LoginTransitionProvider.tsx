import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import AnimatedHelm from '../AnimatedHelm/AnimatedHelm'
import { LoginTransitionContext } from './LoginTransitionContext'
import './LoginTransition.css'

// The helm animation lasts ~1.75 s; a backgrounded tab can pause it, so the sign-in never waits longer than this.
const MAX_PLAY_MS = 2000
// Matches the fade-out (`--duration-slow`, 260 ms) plus a margin, then the cover is removed.
const LEAVE_MS = 300

interface TransitionState {
  /** Restarts the sprite when a new transition starts. */
  id: number
  label: string
  leaving: boolean
}

interface LoginTransitionProviderProps {
  children: ReactNode
}

/**
 * Hosts the post-sign-in cover: the helm receiving a coin, over everything. It sits outside the router so it
 * survives the navigation it covers, then fades out over the screen the user lands on.
 */
export function LoginTransitionProvider({ children }: LoginTransitionProviderProps) {
  const reduceMotion = usePrefersReducedMotion()
  const [transition, setTransition] = useState<TransitionState | null>(null)
  const resolveRef = useRef<((played: boolean) => void) | null>(null)
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const nextIdRef = useRef(0)

  // The animation ended (or took too long): let the caller navigate, then fade the cover out.
  const finish = useCallback(() => {
    clearTimeout(playTimeoutRef.current)
    const resolve = resolveRef.current
    if (!resolve) return
    resolveRef.current = null
    resolve(true)

    setTransition((current) => (current ? { ...current, leaving: true } : current))
    leaveTimeoutRef.current = setTimeout(() => setTransition(null), LEAVE_MS)
  }, [])

  const play = useCallback(
    (label: string) => {
      if (reduceMotion) return Promise.resolve(false)

      // A transition already running (a double submit) is let go before the new one starts.
      resolveRef.current?.(true)
      clearTimeout(playTimeoutRef.current)
      clearTimeout(leaveTimeoutRef.current)

      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve
        nextIdRef.current += 1
        setTransition({ id: nextIdRef.current, label, leaving: false })
        playTimeoutRef.current = setTimeout(finish, MAX_PLAY_MS)
      })
    },
    [reduceMotion, finish],
  )

  useEffect(
    () => () => {
      clearTimeout(playTimeoutRef.current)
      clearTimeout(leaveTimeoutRef.current)
    },
    [],
  )

  const value = useMemo(() => ({ play }), [play])

  return (
    <LoginTransitionContext.Provider value={value}>
      {children}
      {transition ? (
        <div
          className={`lm-login-transition${transition.leaving ? ' lm-login-transition--leaving' : ''}`}
          role="status"
          aria-live="polite"
        >
          <AnimatedHelm key={transition.id} variant="receive" onEnd={finish} />
          <span className="lm-login-transition__label">{transition.label}</span>
        </div>
      ) : null}
    </LoginTransitionContext.Provider>
  )
}
