import { describe, expect, it } from 'vitest'
import { MAX_PLAY_MS, REVEAL_AT_MS, revealDelay, supportsRevealMask } from './revealSchedule'

describe('revealDelay', () => {
  it('waits while the screen underneath is still loading', () => {
    expect(revealDelay(REVEAL_AT_MS + 500, false)).toBeNull()
  })

  it('opens at the sparkles when the screen underneath is already there', () => {
    expect(revealDelay(600, true)).toBe(REVEAL_AT_MS - 600)
  })

  it('opens right away when the screen arrives after the sparkles', () => {
    expect(revealDelay(REVEAL_AT_MS + 300, true)).toBe(0)
  })

  it('opens before the cover gives up', () => {
    expect(REVEAL_AT_MS).toBeLessThan(MAX_PLAY_MS)
  })
})

describe('supportsRevealMask', () => {
  it('needs typed custom properties, which animate the circle smoothly', () => {
    expect(supportsRevealMask({ registerProperty: () => {}, supports: () => true })).toBe(true)
    expect(supportsRevealMask({ supports: () => true })).toBe(false)
  })

  it('needs CSS masks', () => {
    expect(supportsRevealMask({ registerProperty: () => {}, supports: () => false })).toBe(false)
  })

  it('is false without the CSS API at all', () => {
    expect(supportsRevealMask(undefined)).toBe(false)
  })
})
