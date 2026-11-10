import { useEffect, useSyncExternalStore } from 'react'
import { getCurrentUserSnapshot, loadCurrentUser, subscribeCurrentUser } from '../services/currentUserStore'

/**
 * The signed-in user's name and e-mail (`null` while loading or if the request failed; `failed` tells them apart).
 * One state shared by every caller (`shared/services/currentUserStore.ts`): loaded once per session, and a new name
 * saved in "My account" shows everywhere at once.
 */
export function useCurrentUser() {
  const { user, failed } = useSyncExternalStore(subscribeCurrentUser, getCurrentUserSnapshot)

  useEffect(() => {
    void loadCurrentUser()
  }, [])

  // `retry`: after a failure, asks again (the screen shows it loading meanwhile).
  return { name: user?.name ?? null, email: user?.email ?? null, failed, retry: loadCurrentUser }
}
