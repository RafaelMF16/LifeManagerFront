/*
 * Which account turned the habit reminders on in this browser. The push subscription itself doesn't say: when a
 * session ends without a logout (it expired) and someone else signs in here, the subscription still delivers the
 * previous account's reminders. The login compares the two and drops a subscription of another account.
 */
const PUSH_OWNER_KEY = 'lm-push-owner'

/** The user id inside the access token (the backend's `NameIdentifier`, written as `nameid`); null when unreadable. */
export function accessTokenUserId(token: string | null): string | null {
  const payload = token?.split('.')[1]
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))) as Record<string, unknown>
    const userId = claims.nameid
    return typeof userId === 'string' || typeof userId === 'number' ? String(userId) : null
  } catch {
    return null
  }
}

export function readPushOwner(): string | null {
  try {
    return localStorage.getItem(PUSH_OWNER_KEY)
  } catch {
    return null
  }
}

export function savePushOwner(userId: string): void {
  try {
    localStorage.setItem(PUSH_OWNER_KEY, userId)
  } catch {
    // Storage blocked: the next login on this browser drops the subscription, which only costs turning it on again.
  }
}

export function clearPushOwner(): void {
  try {
    localStorage.removeItem(PUSH_OWNER_KEY)
  } catch {
    // Nothing to clear.
  }
}
