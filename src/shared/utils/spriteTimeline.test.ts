import { describe, expect, it } from 'vitest'
import { HELM_LOOP_FRAMES, HELM_RECEIVE_FRAMES, buildSpriteTimeline } from './spriteTimeline'

describe('buildSpriteTimeline', () => {
  it('lasts as long as all its frames together', () => {
    const { durationMs } = buildSpriteTimeline([100, 50, 250], 64)

    expect(durationMs).toBe(400)
  })

  it('starts each frame when the previous ones have played', () => {
    const { keyframes } = buildSpriteTimeline([100, 50, 250], 64)

    expect(keyframes.map((keyframe) => keyframe.offset)).toEqual([0, 0.25, 0.375, 1])
  })

  it('moves the strip one frame width further for each frame', () => {
    const { keyframes } = buildSpriteTimeline([100, 50, 250], 192)

    expect(keyframes.slice(0, 3).map((keyframe) => keyframe.transform)).toEqual([
      'translateX(0px)',
      'translateX(-192px)',
      'translateX(-384px)',
    ])
  })

  it('jumps between frames instead of sliding', () => {
    const { keyframes } = buildSpriteTimeline([100, 50, 250], 64)

    expect(keyframes.slice(0, 3).every((keyframe) => keyframe.easing === 'step-end')).toBe(true)
  })

  it('holds the last frame until the end', () => {
    const { keyframes } = buildSpriteTimeline([100, 50, 250], 64)

    expect(keyframes.at(-1)).toEqual({ offset: 1, transform: 'translateX(-128px)' })
  })
})

describe('helm frames', () => {
  it('has 24 frames in each animation, one per sprite in the sheet', () => {
    expect(HELM_LOOP_FRAMES).toHaveLength(24)
    expect(HELM_RECEIVE_FRAMES).toHaveLength(24)
  })

  it('loops the helm every 1.68 s', () => {
    expect(buildSpriteTimeline(HELM_LOOP_FRAMES, 64).durationMs).toBe(1680)
  })

  it('keeps the sign-in animation between 1.4 s and 1.8 s', () => {
    const { durationMs } = buildSpriteTimeline(HELM_RECEIVE_FRAMES, 64)

    expect(durationMs).toBeGreaterThanOrEqual(1400)
    expect(durationMs).toBeLessThanOrEqual(1800)
  })
})
