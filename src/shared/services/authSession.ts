import { apiRequest } from './httpClient'
import { emitSessionExpired } from './sessionEvents'
import { clearAccessToken, setAccessToken } from './tokenStorage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const REFRESH_LOCK_NAME = 'lm-token-refresh'

// Lives in shared/ (not auth/services) because it's triggered from the shared Header.
// The backend revokes the refresh token and deletes its HttpOnly cookie (sent via `credentials: 'include'`);
// the local access token is cleared even if that call fails, so the user can always sign out.
export async function logout(): Promise<void> {
  try {
    await apiRequest<void>('/api/Auth/Logout', { method: 'POST' })
  } catch {
    // Ignored on purpose: signing out locally must not depend on the server.
  } finally {
    clearAccessToken()
  }
}

let refreshInFlight: Promise<boolean> | null = null

/**
 * Trades the HttpOnly refresh token cookie for a new access token (the backend rotates the cookie too).
 *
 * Single-flight: concurrent callers in this tab share one request. The Web Lock serializes refreshes across
 * tabs, since they all share the same cookie: two tabs sending the same token at once would look like token
 * reuse to the backend, which then revokes the whole session. Inside the lock, a waiting tab sends the cookie
 * the previous tab already rotated.
 */
export function refreshAccessToken(): Promise<boolean> {
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
    // Emitted here, inside the single-flight, so N concurrent 401s redirect (and toast) only once.
    emitSessionExpired()
    return false
  }

  const { accessToken } = (await response.json()) as { accessToken: string }
  setAccessToken(accessToken)
  return true
}
