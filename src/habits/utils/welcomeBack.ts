const STORAGE_KEY = 'lm-habits-welcome-dismissed'

/** The last miss the player dismissed the welcome back for (`yyyy-MM-dd`), or null. Storage can be unavailable. */
export function readWelcomeBackDismissed(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeWelcomeBackDismissed(lastMissedOn: string) {
  try {
    localStorage.setItem(STORAGE_KEY, lastMissedOn)
  } catch {
    // Without storage the banner just shows again next time.
  }
}

/** Welcome the player back after a miss, unless they already dismissed it for that miss or a later one. */
export function shouldWelcomeBack(lastMissedOn: string | null, dismissedFor: string | null) {
  return lastMissedOn !== null && (dismissedFor === null || dismissedFor < lastMissedOn)
}
