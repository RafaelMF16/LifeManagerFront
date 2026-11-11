/**
 * When the sign-in cover (`LoginTransitionProvider`) opens over the screen underneath. Times count from the moment
 * the cover shows up.
 */

/** The navigation runs under the cover once it has faded in (`--duration-base`), so nothing shows through. */
export const NAVIGATE_AFTER_MS = 250

/** The helm's sparkles (`HELM_RECEIVE_SPARKLE_MS` plus their first frames): the earliest the circle opens. */
export const REVEAL_AT_MS = 1450

/** How long the circle takes to cover the screen. */
export const REVEAL_MS = 700

/**
 * The cover never stays longer than this (a background tab pauses timers and animations, a slow chunk keeps the
 * screen from arriving): past it, it fades out over whatever is underneath.
 */
export const MAX_PLAY_MS = 3000

/**
 * How long to wait, from now, before opening the circle: never before the sparkles, and never before the screen
 * underneath is there (`null`: keep waiting), so the circle never shows the sign-in screen.
 */
export function revealDelay(elapsedMs: number, screenReady: boolean): number | null {
  if (!screenReady) return null
  return Math.max(0, REVEAL_AT_MS - elapsedMs)
}

interface CssApi {
  registerProperty?: unknown
  supports: (condition: string) => boolean
}

/**
 * Whether the browser can open the circle: a CSS mask whose radius is a typed custom property (`@property`), the
 * only way it animates smoothly. Without it, the cover fades out instead.
 */
export function supportsRevealMask(css: CssApi | undefined): boolean {
  if (!css || typeof css.registerProperty !== 'function') return false
  return css.supports('mask-image: radial-gradient(circle, transparent 0%, #000 1%)') ||
    css.supports('-webkit-mask-image: radial-gradient(circle, transparent 0%, #000 1%)')
}
