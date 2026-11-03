// The access token lives in memory only, so a script injected into the page (XSS) can't read it from storage. A reload
// or a new tab starts without one and gets a new token from the HttpOnly refresh cookie (`restoreSession`).
let accessToken: string | null = null

// Older versions kept the token in sessionStorage; drop it so it doesn't linger there. Storage can be blocked
// (private mode, site data disabled), and that must not break the app.
const LEGACY_ACCESS_TOKEN_KEY = 'lm.accessToken'
try {
  sessionStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
} catch {
  // Nothing to clean when storage can't be reached.
}

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string): void {
  accessToken = token
}

export function clearAccessToken(): void {
  accessToken = null
}
