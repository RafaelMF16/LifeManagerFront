import { clearPendingInvite } from '../utils/pendingInvite'
import { resetCurrentUser } from './currentUserStore'
import { apiRequest } from './httpClient'
import { emitSessionExpired } from './sessionEvents'
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStorage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const REFRESH_LOCK_NAME = 'lm-token-refresh'

// Lives in shared/ (not auth/services) because it's triggered from the shared Header.
// The backend revokes the refresh token and deletes its HttpOnly cookie (sent via `credentials: 'include'`);
// the local access token is cleared even if that call fails, so the user can always sign out. A pending invite goes
// too, so it isn't offered to whoever signs in next on this browser.
export async function logout(): Promise<void> {
  try {
    await apiRequest<void>('/api/Auth/Logout', { method: 'POST' })
  } catch {
    // Ignored on purpose: signing out locally must not depend on the server.
  } finally {
    endLocalSession()
  }
}

/**
 * "Sign out of every device" (My account): the backend ends every session of the user, this one included, and
 * deletes the cookie. Unlike `logout`, a failure is the caller's to show: nothing ended, so the user stays here.
 */
export async function logoutAll(): Promise<void> {
  await apiRequest<void>('/api/Auth/LogoutAll', { method: 'POST' })
  endLocalSession()
}

/**
 * Forgets this tab's session: the access token, a pending invite (so it isn't offered to whoever signs in next on
 * this browser) and the loaded user. For when the backend already ended the session (logout, sign out everywhere,
 * account deletion).
 */
export function endLocalSession(): void {
  clearAccessToken()
  clearPendingInvite()
  resetCurrentUser()
}

let refreshInFlight: Promise<boolean> | null = null
let notifyingRefreshInFlight: Promise<boolean> | null = null

/**
 * Trades the HttpOnly refresh token cookie for a new access token, announcing an expired session when the
 * backend rejects it. Used by `apiRequest` on a 401, when the user was signed in until now.
 *
 * Single-flight, so N concurrent 401s refresh (and announce) only once.
 */
export function refreshAccessToken(): Promise<boolean> {
  notifyingRefreshInFlight ??= refreshSession()
    .then((refreshed) => {
      if (!refreshed) emitSessionExpired()
      return refreshed
    })
    .finally(() => {
      notifyingRefreshInFlight = null
    })

  return notifyingRefreshInFlight
}

/**
 * Resolves whether this tab has a session, renewing it from the refresh cookie when there's no access token
 * (a new tab or a reload). Silent: someone who never signed in, or just signed out, isn't told it "expired".
 */
export function restoreSession(): Promise<boolean> {
  return getAccessToken() ? Promise.resolve(true) : refreshSession()
}

/**
 * Trades the HttpOnly refresh token cookie for a new access token (the backend rotates the cookie too).
 *
 * Single-flight: concurrent callers in this tab share one request. The Web Lock serializes refreshes across
 * tabs, since they all share the same cookie: two tabs sending the same token at once would look like token
 * reuse to the backend, which then revokes the whole session. Inside the lock, a waiting tab sends the cookie
 * the previous tab already rotated.
 */
function refreshSession(): Promise<boolean> {
  refreshInFlight ??= withRefreshLock(requestNewAccessToken).finally(() => {
    refreshInFlight = null
  })

  return refreshInFlight
}

function withRefreshLock(task: () => Promise<boolean>): Promise<boolean> {
  const locks = globalThis.navigator?.locks
  return locks ? locks.request(REFRESH_LOCK_NAME, task) : task()
}

// Uses `fetch` directly instead of `apiRequest`, whose 401 handling calls this function.
// Resolves `false` only when the backend rejects the refresh token; a network failure rejects instead,
// so a flaky connection doesn't sign the user out.
async function requestNewAccessToken(): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/api/Auth/Refresh`, { method: 'POST', credentials: 'include' })

  if (!response.ok) {
    clearAccessToken()
    return false
  }

  const { accessToken } = (await response.json()) as { accessToken: string }
  setAccessToken(accessToken)
  return true
}
