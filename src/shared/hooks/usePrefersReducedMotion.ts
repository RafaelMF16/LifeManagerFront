import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(listener: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', listener)
  return () => media.removeEventListener('change', listener)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

/**
 * Whether the user asked the system for less motion. For animations driven from JS (the Web Animations API, timed
 * overlays); CSS animations keep using `@media (prefers-reduced-motion: no-preference)` instead.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}
