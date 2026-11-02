// An invite link opened while signed out, kept until the ranking screen can offer it (after a login, or a sign-up
// confirmed by e-mail, which loses the router state). Lives in `shared/` because the home screen reads it too.
const PENDING_INVITE_KEY = 'lm-pending-invite'

// As long as the sign-up link lasts: past that, or after a logout, the invite isn't offered to whoever signs in next.
export const PENDING_INVITE_MAX_AGE_MS = 24 * 60 * 60 * 1000

interface StoredInvite {
  code: string
  savedAt: number
}

export function savePendingInvite(code: string) {
  try {
    localStorage.setItem(PENDING_INVITE_KEY, JSON.stringify({ code, savedAt: Date.now() } satisfies StoredInvite))
  } catch {
    // Storage blocked: the invite is only lost after a sign-up; a plain login still returns to the ranking.
  }
}

export function readPendingInvite(): string | null {
  try {
    const stored = JSON.parse(localStorage.getItem(PENDING_INVITE_KEY) ?? 'null') as Partial<StoredInvite> | null
    const isFresh = typeof stored?.savedAt === 'number' && Date.now() - stored.savedAt <= PENDING_INVITE_MAX_AGE_MS
    return isFresh && typeof stored.code === 'string' && stored.code ? stored.code : null
  } catch {
    return null
  }
}

export function clearPendingInvite() {
  try {
    localStorage.removeItem(PENDING_INVITE_KEY)
  } catch {
    // Nothing to clear.
  }
}
