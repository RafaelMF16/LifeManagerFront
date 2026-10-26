import { useCallback, useEffect, useState } from 'react'
import { resendSecondsLeft } from '../utils/resendCooldown'

/**
 * Seconds left before "resend e-mail" may be used again, counting down once a second. Starts counting on mount (the
 * first e-mail was just requested); `restart()` after each resend.
 */
export function useResendCooldown() {
  const [sentAt, setSentAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const secondsLeft = resendSecondsLeft(sentAt, now)
  const waiting = secondsLeft > 0

  useEffect(() => {
    if (!waiting) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [waiting])

  const restart = useCallback(() => {
    const at = Date.now()
    setSentAt(at)
    setNow(at)
  }, [])

  return { secondsLeft, restart }
}
