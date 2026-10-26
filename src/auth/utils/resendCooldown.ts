// Mirrors the backend's per-address cooldown (EmailCooldown.Duration): resending earlier sends nothing.
export const RESEND_COOLDOWN_SECONDS = 60

/** Whole seconds until "resend" may be used again, given when the last e-mail was requested (epoch ms). */
export function resendSecondsLeft(sentAt: number, now: number, cooldownSeconds = RESEND_COOLDOWN_SECONDS): number {
  return Math.max(0, Math.ceil((sentAt + cooldownSeconds * 1000 - now) / 1000))
}
