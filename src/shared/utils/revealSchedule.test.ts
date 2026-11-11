import { describe, expect, it } from 'vitest'
import { HELM_RECEIVE_DURATION_MS, HELM_RECEIVE_SPARKLE_MS } from './helmTimeline'
import { MAX_PLAY_MS, REVEAL_AT_MS, revealDelay, supportsRevealMask } from './revealSchedule'

describe('revealDelay', () => {
  it('opens at the sparkles when the screen underneath is already there', () => {
    expect(revealDelay(600)).toBe(REVEAL_AT_MS - 600)
  })

  it('opens right away when the screen arrives after the sparkles', () => {
    expect(revealDelay(REVEAL_AT_MS + 300)).toBe(0)
  })

  it('opens after the sparkles start, before the helm is done', () => {
    expect(REVEAL_AT_MS).toBeGreaterThan(HELM_RECEIVE_SPARKLE_MS)
    expect(REVEAL_AT_MS).toBeLessThan(HELM_RECEIVE_DURATION_MS)
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

  it('accepts the -webkit- prefixed mask', () => {
    const supports = (condition: string) => condition.startsWith('-webkit-')
    expect(supportsRevealMask({ registerProperty: () => {}, supports })).toBe(true)
  })

  it('needs CSS masks', () => {
    expect(supportsRevealMask({ registerProperty: () => {}, supports: () => false })).toBe(false)
  })

  it('is false without the CSS API at all', () => {
    expect(supportsRevealMask(undefined)).toBe(false)
  })
})
