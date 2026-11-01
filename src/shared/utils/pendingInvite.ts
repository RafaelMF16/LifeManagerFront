// An invite link opened while signed out, kept until the ranking screen can offer it (after a login, or a sign-up
// confirmed by e-mail, which loses the router state). Lives in `shared/` because the home screen reads it too.
const PENDING_INVITE_KEY = 'lm-pending-invite'

export function savePendingInvite(code: string) {
  try {
    localStorage.setItem(PENDING_INVITE_KEY, code)
  } catch {
    // Storage blocked: the invite is only lost after a sign-up; a plain login still returns to the ranking.
  }
}

export function readPendingInvite(): string | null {
  try {
    return localStorage.getItem(PENDING_INVITE_KEY)
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
