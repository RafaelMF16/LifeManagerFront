export interface SpriteTimeline {
  keyframes: Keyframe[]
  durationMs: number
}

/** The helm's loop (one spoke turned, two coins in): 24 frames of 70 ms. */
export const HELM_LOOP_FRAMES: readonly number[] = Array.from({ length: 24 }, () => 70)

/**
 * The coin going into the helm, 1.63 s so it doesn't hold up a daily sign-in: the still helm (120 ms), the coin's
 * flight (13 frames of 49 ms), the full turn slowing down as it settles (56 → 84 ms) and the final sparkle (250 ms).
 */
export const HELM_RECEIVE_FRAMES: readonly number[] = [
  120,
  ...Array.from({ length: 13 }, () => 49),
  56, 56, 56, 63, 70, 77, 84, 77, 84,
  250,
]

/**
 * Turns a horizontal sprite strip's frame lengths into Web Animations keyframes that move the strip one frame width
 * per frame. Each keyframe eases with `step-end`, so a frame stays still for its whole length instead of sliding.
 */
export function buildSpriteTimeline(frameDurationsMs: readonly number[], frameSizePx: number): SpriteTimeline {
  const durationMs = frameDurationsMs.reduce((total, ms) => total + ms, 0)
  const translate = (index: number) => `translateX(${-index * frameSizePx}px)`

  let elapsedMs = 0
  const keyframes: Keyframe[] = frameDurationsMs.map((ms, index) => {
    const keyframe: Keyframe = { offset: elapsedMs / durationMs, transform: translate(index), easing: 'step-end' }
    elapsedMs += ms
    return keyframe
  })
  // Holds the last frame until the animation ends.
  keyframes.push({ offset: 1, transform: translate(frameDurationsMs.length - 1) })

  return { keyframes, durationMs }
}
