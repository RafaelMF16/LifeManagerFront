import { describe, expect, it } from 'vitest'
import { RESEND_COOLDOWN_SECONDS, resendSecondsLeft } from './resendCooldown'

describe('resendSecondsLeft', () => {
  const sentAt = Date.UTC(2026, 9, 26, 12, 0, 0)

  it('starts at the whole cooldown right after sending', () => {
    expect(resendSecondsLeft(sentAt, sentAt)).toBe(RESEND_COOLDOWN_SECONDS)
  })

  it('rounds partial seconds up, so it never shows 0 while still waiting', () => {
    expect(resendSecondsLeft(sentAt, sentAt + 59_001)).toBe(1)
  })

  it('reaches 0 once the cooldown passed', () => {
    expect(resendSecondsLeft(sentAt, sentAt + RESEND_COOLDOWN_SECONDS * 1000)).toBe(0)
  })

  it('never goes negative', () => {
    expect(resendSecondsLeft(sentAt, sentAt + 10 * 60_000)).toBe(0)
  })
})
