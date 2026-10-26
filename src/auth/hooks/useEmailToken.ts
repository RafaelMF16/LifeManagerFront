import { useCallback, useEffect, useState } from 'react'
import { isApiError } from '../../shared/types/ApiError'
import { readEmailLinkToken, withoutEmailLinkToken } from '../utils/emailLinkToken'

export type EmailTokenState<T> =
  | { status: 'loading' }
  | { status: 'valid'; token: string; data: T }
  // Unknown, expired or used link (or no token at all)
  | { status: 'invalid' }
  // Couldn't reach the API: the link may still be fine
  | { status: 'error' }

/**
 * Reads the token of an auth e-mail link (`?token=`), removes it from the address bar before any request, and checks
 * it with `verify`. Any API error means an invalid link (the backend answers one code for unknown, expired and used).
 */
export function useEmailToken<T>(verify: (token: string, signal: AbortSignal) => Promise<T>) {
  // Read once, on the first render: the effect below removes it from the URL.
  const [token] = useState(() => readEmailLinkToken(window.location.search))
  const [state, setState] = useState<EmailTokenState<T>>(() => (token ? { status: 'loading' } : { status: 'invalid' }))
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (readEmailLinkToken(window.location.search)) {
      window.history.replaceState(window.history.state, '', withoutEmailLinkToken(window.location.href))
    }
  }, [])

  useEffect(() => {
    if (!token) return

    const controller = new AbortController()
    verify(token, controller.signal)
      .then((data) => setState({ status: 'valid', token, data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setState(isApiError(err) ? { status: 'invalid' } : { status: 'error' })
      })

    return () => controller.abort()
  }, [token, verify, attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((current) => current + 1)
  }, [])

  // The link stopped working while the form was open (used in another tab, or renewed by a new sign-up).
  const markInvalid = useCallback(() => setState({ status: 'invalid' }), [])

  return { state, retry, markInvalid }
}
