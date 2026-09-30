import { apiRequest } from './httpClient'
import { clearAccessToken } from './tokenStorage'

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
