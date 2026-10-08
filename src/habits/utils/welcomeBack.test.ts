import { describe, expect, it } from 'vitest'
import { shouldWelcomeBack } from './welcomeBack'

describe('shouldWelcomeBack', () => {
  it('welcomes the player back after a miss never dismissed', () => {
    expect(shouldWelcomeBack('2026-10-05', null)).toBe(true)
  })

  it('stays quiet once that miss was dismissed', () => {
    expect(shouldWelcomeBack('2026-10-05', '2026-10-05')).toBe(false)
  })

  it('comes back for a newer miss', () => {
    expect(shouldWelcomeBack('2026-10-09', '2026-10-05')).toBe(true)
  })

  it('stays quiet without a recent miss', () => {
    expect(shouldWelcomeBack(null, null)).toBe(false)
  })
})
