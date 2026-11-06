export interface SpriteTimeline {
  keyframes: Keyframe[]
  durationMs: number
}

/** The wallet's loop (`splash_loop`): 24 frames of 70 ms. */
export const WALLET_LOOP_FRAMES: readonly number[] = Array.from({ length: 24 }, () => 70)

/**
 * The bill going into the wallet (`feedback_receita`), shortened from 2.9 s to 1.63 s so it doesn't hold up a daily
 * sign-in: the first frame goes from 400 to 120 ms, the final sparkle from 700 to 250 ms, and the 22 in between play
 * at 70% of their original length (70→49, 80→56, 90→63, 100→70, 110→77, 120→84).
 */
export const WALLET_RECEIVE_FRAMES: readonly number[] = [
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
