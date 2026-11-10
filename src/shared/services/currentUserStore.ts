import type { CurrentUserDto } from '../types/CurrentUserDtos'
import { getCurrentUser } from './currentUserService'

export interface CurrentUserState {
  user: CurrentUserDto | null
  /** The last load failed; the next subscriber tries again. */
  failed: boolean
}

const EMPTY: CurrentUserState = { user: null, failed: false }

const listeners = new Set<() => void>()
let state: CurrentUserState = EMPTY
let loading: Promise<void> | null = null
// Bumped by every reset, so a load that started for the previous session can't write its answer into the next one.
let generation = 0

function setState(next: CurrentUserState) {
  state = next
  listeners.forEach((listener) => listener())
}

export function subscribeCurrentUser(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getCurrentUserSnapshot(): CurrentUserState {
  return state
}

/**
 * Loads the signed-in user once per session, however many components ask (the Header, the Home, My account...).
 * Nothing to do while it's loading or once it's loaded; after a failure, the next call tries again.
 */
export function loadCurrentUser(): Promise<void> {
  if (state.user || loading) return loading ?? Promise.resolve()

  const loadGeneration = generation
  // A retry after a failure shows as loading again (a skeleton), not as the old error.
  if (state.failed) setState(EMPTY)
  loading = getCurrentUser()
    .then(
      (user) => {
        if (loadGeneration === generation) setState({ user, failed: false })
      },
      () => {
        // Nothing else to show: an expired session is already redirected by the root route (RootLayout in App.tsx).
        if (loadGeneration === generation) setState({ user: null, failed: true })
      },
    )
    .finally(() => {
      if (loadGeneration === generation) loading = null
    })

  return loading
}

/** After "My account" saved a new name: every screen showing it updates at once. */
export function setCurrentUserName(name: string): void {
  if (state.user) setState({ ...state, user: { ...state.user, name } })
}

/** The session ended (logout, sign out everywhere, account deletion) or a new one started: forget the user. */
export function resetCurrentUser(): void {
  generation++
  loading = null
  setState(EMPTY)
}
