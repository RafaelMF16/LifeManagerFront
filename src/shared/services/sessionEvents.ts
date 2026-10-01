type SessionExpiredListener = () => void

const listeners = new Set<SessionExpiredListener>()

// The httpClient has no access to the router, so it announces an expired session here and
// `useSessionExpiredRedirect` (mounted inside the router) reacts by sending the user to /auth.
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitSessionExpired(): void {
  listeners.forEach((listener) => listener())
}
