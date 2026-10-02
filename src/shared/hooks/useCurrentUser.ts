import { useEffect, useState } from 'react'
import { getCurrentUser } from '../services/currentUserService'

/** Loads the signed-in user's name; stays `null` while loading or if the request fails. */
export function useCurrentUser() {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    // Aborted on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    getCurrentUser(controller.signal).then(
      (user) => {
        if (!controller.signal.aborted) setName(user.name)
      },
      () => {
        // Nothing to show: an expired session is already redirected by SessionExpiredListener.
      },
    )

    return () => controller.abort()
  }, [])

  return { name }
}
