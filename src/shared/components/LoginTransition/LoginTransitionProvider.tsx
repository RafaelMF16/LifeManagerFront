import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import type { LoginEntrance } from '../../utils/loginEntrance'
import {
  MAX_PLAY_MS,
  NAVIGATE_AFTER_MS,
  REVEAL_MS,
  revealDelay,
  supportsRevealMask,
} from '../../utils/revealSchedule'
import AnimatedHelm from '../AnimatedHelm/AnimatedHelm'
import { LoginTransitionContext } from './LoginTransitionContext'
import './LoginTransition.css'

// Matches the fade-out (`--duration-slow`, 260 ms) plus a margin, then the cover is removed.
const FADE_MS = 300
// Two frames take ~33 ms at 60 Hz; this only bounds the wait in a tab that paints nothing.
const FRAMES_LIMIT_MS = 150

type CoverPhase = 'covering' | 'revealing' | 'fading'

interface TransitionState {
  /** Restarts the helm when a new transition starts. */
  id: number
  label: string
  phase: CoverPhase
}

interface LoginTransitionProviderProps {
  children: ReactNode
}

/**
 * Resolves after `count` painted frames, so a screen React just committed is on screen; or after `FRAMES_LIMIT_MS`,
 * since a background tab paints nothing (and runs no frame callbacks) until it's shown again.
 */
function afterFrames(count: number) {
  return new Promise<void>((resolve) => {
    const step = (left: number) => (left === 0 ? resolve() : requestAnimationFrame(() => step(left - 1)))
    step(count)
    setTimeout(resolve, FRAMES_LIMIT_MS)
  })
}

/**
 * Hosts the post-sign-in cover: the helm receiving a coin, over everything. It sits outside the router so it
 * survives the navigation it covers: the caller's `go` runs under the cover, and once the new screen is painted (and
 * the helm sparkles), the cover opens in a circle from the helm's center, the new screen showing through it. Without
 * typed custom properties, or when the screen takes too long (`MAX_PLAY_MS`), it fades out instead.
 */
export function LoginTransitionProvider({ children }: LoginTransitionProviderProps) {
  const reduceMotion = usePrefersReducedMotion()
  const [transition, setTransition] = useState<TransitionState | null>(null)
  const resolveRef = useRef<((played: boolean) => void) | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const nextIdRef = useRef(0)

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const later = useCallback((ms: number, run: () => void) => {
    timersRef.current.push(setTimeout(run, ms))
  }, [])

  // Opens the cover (once per transition), lets the caller go on and removes the cover when it's gone.
  const leave = useCallback(
    (id: number, phase: Exclude<CoverPhase, 'covering'>) => {
      if (nextIdRef.current !== id || !resolveRef.current) return
      clearTimers()
      const resolve = resolveRef.current
      resolveRef.current = null
      resolve(true)

      setTransition((current) => (current?.id === id ? { ...current, phase } : current))
      later(phase === 'revealing' ? REVEAL_MS + 50 : FADE_MS, () =>
        setTransition((current) => (current?.id === id ? null : current)),
      )
    },
    [clearTimers, later],
  )

  const play = useCallback(
    async (label: string, go: () => void | Promise<void>) => {
      if (reduceMotion) {
        await go()
        return false
      }

      // A transition already running (a double submit) is let go before the new one starts.
      resolveRef.current?.(true)
      clearTimers()

      const id = nextIdRef.current + 1
      nextIdRef.current = id
      const startedAt = performance.now()
      const exit = supportsRevealMask(typeof CSS === 'undefined' ? undefined : CSS) ? 'revealing' : 'fading'
      setTransition({ id, label, phase: 'covering' })

      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve
        later(MAX_PLAY_MS, () => leave(id, 'fading'))
        later(NAVIGATE_AFTER_MS, () => {
          Promise.resolve()
            .then(go)
            .catch(() => {})
            .then(() => afterFrames(2))
            .then(() => {
              const delay = revealDelay(performance.now() - startedAt, true)
              if (delay !== null) later(delay, () => leave(id, exit))
            })
        })
      })
    },
    [reduceMotion, clearTimers, later, leave],
  )

  useEffect(() => clearTimers, [clearTimers])

  const phase = transition?.phase
  const entrance: LoginEntrance = phase === undefined ? null : phase === 'covering' ? 'hidden' : 'enter'
  const value = useMemo(() => ({ play, entrance }), [play, entrance])

  return (
    <LoginTransitionContext.Provider value={value}>
      {children}
      {transition ? (
        <div
          className={`lm-login-transition${phase === 'covering' ? '' : ` lm-login-transition--${phase}`}`}
          role="status"
          aria-live="polite"
        >
          <AnimatedHelm key={transition.id} variant="receive" />
          <span className="lm-login-transition__label">{transition.label}</span>
        </div>
      ) : null}
    </LoginTransitionContext.Provider>
  )
}
