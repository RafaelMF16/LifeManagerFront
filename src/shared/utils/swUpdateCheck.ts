/** The browser only looks for a new service worker on a real page load, never on the SPA's screen changes. */
export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000
/** Coming back to the tab checks too, but not more than once in this gap. */
export const UPDATE_CHECK_MIN_GAP_MS = 5 * 60 * 1000

interface UpdateCheckContext {
  lastCheckAt: number | null
  now: number
  online: boolean
}

export function shouldCheckForUpdate({ lastCheckAt, now, online }: UpdateCheckContext): boolean {
  if (!online) return false
  return lastCheckAt === null || now - lastCheckAt >= UPDATE_CHECK_MIN_GAP_MS
}
