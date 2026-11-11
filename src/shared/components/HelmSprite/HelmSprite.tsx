import { useEffect, useRef } from 'react'
import helmLoopUrl from '../../../assets/helm/helm-loop.png'
import helmReceiveUrl from '../../../assets/helm/helm-receive.png'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { HELM_LOOP_FRAMES, HELM_RECEIVE_FRAMES, buildSpriteTimeline } from '../../utils/spriteTimeline'
import './HelmSprite.css'

export type HelmSpriteVariant = 'loop' | 'receive'

const SPRITES: Record<HelmSpriteVariant, { url: string; frames: readonly number[] }> = {
  loop: { url: helmLoopUrl, frames: HELM_LOOP_FRAMES },
  receive: { url: helmReceiveUrl, frames: HELM_RECEIVE_FRAMES },
}

/** The sign-in animation's sprite sheet, so a page can preload it before the transition shows it. */
export const HELM_RECEIVE_URL = helmReceiveUrl

interface HelmSpriteProps {
  /**
   * `loop`: the helm steers while coins fly into its hub, forever. `receive`: one coin goes in, the helm turns a full
   * circle and sparkles, once.
   */
  variant: HelmSpriteVariant
  /** Side in px; a multiple of the sheet's 64 px frames keeps the pixel art sharp. */
  size?: 128 | 192 | 256
  /** `receive` only: called once, when the last frame has played (right away with reduced motion). */
  onEnd?: () => void
}

/**
 * The pixel-art helm (`scripts/generate-helm-sprites.mjs`): a clipped window over the whole sprite strip, which moves one frame at a time with the Web
 * Animations API (a `transform`, so it runs on the compositor). Decorative: the caller labels what it means.
 */
function HelmSprite({ variant, size = 192, onEnd }: HelmSpriteProps) {
  const stripRef = useRef<HTMLImageElement>(null)
  const onEndRef = useRef(onEnd)
  // Survives StrictMode's second effect run, so `onEnd` fires once even when the first run already ended.
  const endedRef = useRef(false)
  const reduceMotion = usePrefersReducedMotion()
  const { url, frames } = SPRITES[variant]

  useEffect(() => {
    onEndRef.current = onEnd
  }, [onEnd])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return

    const end = () => {
      if (variant !== 'receive' || endedRef.current) return
      endedRef.current = true
      onEndRef.current?.()
    }

    if (reduceMotion || typeof strip.animate !== 'function') {
      end()
      return
    }

    const { keyframes, durationMs } = buildSpriteTimeline(frames, size)
    const animation = strip.animate(keyframes, {
      duration: durationMs,
      iterations: variant === 'loop' ? Infinity : 1,
      fill: 'forwards',
    })
    // Cancelling (unmount, StrictMode) rejects `finished` with an AbortError: that run just never ends.
    animation.finished.then(end, () => {})

    return () => animation.cancel()
  }, [variant, frames, size, reduceMotion])

  // Without motion, a still frame: the helm for the loop, the finished sparkle for `receive`.
  const stillFrame = reduceMotion && variant === 'receive' ? frames.length - 1 : 0

  return (
    <span className="lm-helm-sprite" style={{ width: size, height: size }} aria-hidden="true">
      <img
        ref={stripRef}
        className="lm-helm-sprite__strip"
        src={url}
        alt=""
        width={size * frames.length}
        height={size}
        draggable={false}
        style={{ transform: `translateX(${-stillFrame * size}px)` }}
      />
    </span>
  )
}

export default HelmSprite
