import { useEffect, useState } from 'react'
import { getCurrentUser } from '../services/currentUserService'

/** Loads the signed-in user's name; stays `null` while loading or if the request fails (`failed` tells them apart). */
export function useCurrentUser() {
  const [name, setName] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    // Aborted on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    getCurrentUser(controller.signal).then(
      (user) => {
        if (!controller.signal.aborted) setName(user.name)
      },
      () => {
        if (!controller.signal.aborted) setFailed(true)
        // Nothing else to show: an expired session is already redirected by the root route (RootLayout in App.tsx).
      },
    )

    return () => controller.abort()
  }, [])

  return { name, failed }
}
