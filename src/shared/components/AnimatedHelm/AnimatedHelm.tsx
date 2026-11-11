import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { helmLoopTimeline } from '../../utils/helmTimeline'
import type { HelmTimeline } from '../../utils/helmTimeline'
import { HelmHub, HelmShine, HelmWheel } from '../AppLogo/HelmParts'
import './AnimatedHelm.css'

export type AnimatedHelmVariant = 'loop'

const TIMELINES: Record<AnimatedHelmVariant, () => HelmTimeline> = {
  loop: helmLoopTimeline,
}

/** A four-point star centered at (0, 0). */
const SPARK_PATH = 'M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4Z'

/** Where the sparkles shine, around the rim, and which ones are teal. */
const SPARKS = [
  { x: 14, y: 20, teal: false },
  { x: 88, y: 16, teal: true },
  { x: 90, y: 84, teal: false },
  { x: 10, y: 82, teal: true },
] as const

interface AnimatedHelmProps {
  /** `loop`: the helm turns a spoke for each coin that lands in its hub, forever. */
  variant: AnimatedHelmVariant
  /** The helm's side in px (any size: it's vector). */
  size?: number
}

function Coin({ id }: { id: 'coin1' | 'coin2' }) {
  return (
    <g data-part={`${id}X`}>
      <g data-part={`${id}Y`}>
        <g data-part={`${id}Scale`} className="lm-animated-helm__spin lm-animated-helm__hidden">
          <circle className="lm-animated-helm__coin" cx={50} cy={50} r={6.5} />
          <circle className="lm-animated-helm__coin-mark" cx={50} cy={50} r={3.6} />
          <circle className="lm-animated-helm__coin-shine" cx={47.6} cy={47.6} r={1.4} />
        </g>
      </g>
    </g>
  )
}

/**
 * The app's mark (`HelmParts`, the same drawing as `AppLogo`) animated with the Web Animations API from the keyframes
 * of `utils/helmTimeline.ts`: amber coins, the habits game's, fly into its hub and turn it. Only the wheel turns; the
 * rim's shine stays lit from the top left. Decorative: the caller labels what it means. With reduced motion, a still
 * helm.
 */
function AnimatedHelm({ variant, size = 192 }: AnimatedHelmProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || reduceMotion || typeof svg.animate !== 'function') return

    const { durationMs, iterations, tracks } = TIMELINES[variant]()
    const animations = tracks.flatMap(({ part, keyframes }) => {
      const element = svg.querySelector(`[data-part="${part}"]`)
      return element ? [element.animate(keyframes, { duration: durationMs, iterations, fill: 'forwards' })] : []
    })

    return () => animations.forEach((animation) => animation.cancel())
  }, [variant, reduceMotion])

  return (
    <span className="lm-animated-helm" style={{ width: size, height: size }} aria-hidden="true">
      <svg ref={svgRef} className="lm-animated-helm__svg" viewBox="-22 -22 144 144" focusable="false">
        <g data-part="wheel" className="lm-animated-helm__spin">
          <HelmWheel />
        </g>
        <HelmShine />
        <g data-part="hub" className="lm-animated-helm__spin">
          <HelmHub />
          <circle data-part="hubGlow" className="lm-animated-helm__glow lm-animated-helm__hidden" cx={50} cy={50} r={6.5} />
          <circle className="lm-app-logo__hub-pin" cx={50} cy={50} r={3} />
        </g>
        <circle data-part="pulse" className="lm-animated-helm__pulse lm-animated-helm__spin lm-animated-helm__hidden" cx={50} cy={50} r={10} />
        <Coin id="coin1" />
        <Coin id="coin2" />
        {SPARKS.map(({ x, y, teal }, index) => (
          <g key={index} transform={`translate(${x} ${y})`}>
            <g data-part={`spark${index}`} className="lm-animated-helm__spin lm-animated-helm__hidden">
              <path className={`lm-animated-helm__spark${teal ? ' lm-animated-helm__spark--teal' : ''}`} d={SPARK_PATH} />
            </g>
          </g>
        ))}
      </svg>
    </span>
  )
}

export default AnimatedHelm
