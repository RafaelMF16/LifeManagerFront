/**
 * The helm's animations as plain Web Animations keyframes, one track per part of `AnimatedHelm` (`data-part`), so the
 * timing is testable without a DOM. Only `transform` and `opacity` move: rotations and scales turn around each part's
 * own center (`transform-box: fill-box`), and a coin's arc comes from two nested groups, one easing across and the
 * other easing down.
 */

/** Every `data-part` `AnimatedHelm` draws. */
export const HELM_PARTS = [
  'wheel',
  'hub',
  'hubGlow',
  'pulse',
  'coin1X',
  'coin1Y',
  'coin1Scale',
  'coin2X',
  'coin2Y',
  'coin2Scale',
  'spark0',
  'spark1',
  'spark2',
  'spark3',
] as const

export type HelmPart = (typeof HELM_PARTS)[number]

export interface HelmTrack {
  part: HelmPart
  keyframes: Keyframe[]
}

export interface HelmTimeline {
  durationMs: number
  iterations: number
  tracks: HelmTrack[]
}

/** The helm turning one spoke: a quick start and a small overshoot as it settles. */
const TURN_EASING = 'cubic-bezier(.45,0,.2,1.15)'
const ACROSS_EASING = 'cubic-bezier(.25,.6,.45,1)'
const DOWN_EASING = 'cubic-bezier(.55,0,.85,.55)'

const clamp = (offset: number) => Math.min(1, Math.max(0, offset))

/** A coin flying from (`dx`, `dy`) into the hub between the offsets `start` and `landed`, hidden before and after. */
function coinTracks(coin: 'coin1' | 'coin2', start: number, landed: number, dx: number, dy: number): HelmTrack[] {
  const path = (easing: string, from: string, to: string): Keyframe[] => [
    { offset: 0, transform: from },
    { offset: start, transform: from, easing },
    { offset: landed, transform: to },
    { offset: 1, transform: to },
  ]

  return [
    { part: `${coin}X`, keyframes: path(ACROSS_EASING, `translateX(${dx}px)`, 'translateX(0px)') },
    { part: `${coin}Y`, keyframes: path(DOWN_EASING, `translateY(${dy}px)`, 'translateY(0px)') },
    {
      part: `${coin}Scale`,
      keyframes: [
        { offset: 0, opacity: 0, transform: 'scale(.6)' },
        { offset: start, opacity: 0, transform: 'scale(.6)' },
        { offset: clamp(start + 0.04), opacity: 1, transform: 'scale(1.1)' },
        { offset: clamp(landed - 0.05), opacity: 1, transform: 'scale(.9)' },
        { offset: landed, opacity: 0, transform: 'scale(.25)' },
        { offset: 1, opacity: 0, transform: 'scale(.25)' },
      ],
    },
  ]
}

/** The hub lighting up in the coins' amber, popping and sending out a ring at each offset of `hits`. */
function hubTracks(hits: number[], length: number): HelmTrack[] {
  const glow: Keyframe[] = [{ offset: 0, opacity: 0 }]
  const pop: Keyframe[] = [{ offset: 0, transform: 'scale(1)' }]
  const ring: Keyframe[] = [{ offset: 0, opacity: 0, transform: 'scale(1)' }]

  for (const hit of hits) {
    glow.push({ offset: hit, opacity: 0 }, { offset: clamp(hit + 0.02), opacity: 1 }, { offset: clamp(hit + length), opacity: 0 })
    pop.push(
      { offset: hit, transform: 'scale(1)' },
      { offset: clamp(hit + 0.03), transform: 'scale(1.14)' },
      { offset: clamp(hit + length), transform: 'scale(1)' },
    )
    ring.push(
      { offset: hit, opacity: 0, transform: 'scale(1)' },
      { offset: clamp(hit + 0.005), opacity: 0.9, transform: 'scale(1)' },
      { offset: clamp(hit + length), opacity: 0, transform: 'scale(2.4)' },
    )
  }

  glow.push({ offset: 1, opacity: 0 })
  pop.push({ offset: 1, transform: 'scale(1)' })
  ring.push({ offset: 1, opacity: 0, transform: 'scale(2.4)' })

  return [
    { part: 'hubGlow', keyframes: glow },
    { part: 'hub', keyframes: pop },
    { part: 'pulse', keyframes: ring },
  ]
}

/**
 * The splash: two coins a cycle, from opposite sides, each one lighting the hub and turning the helm one spoke (45°).
 * The drawing repeats every 45°, so ending at 90° loops with no seam.
 */
export function helmLoopTimeline(): HelmTimeline {
  const firstLanding = 0.3
  const secondLanding = 0.8

  return {
    durationMs: 2600,
    iterations: Infinity,
    tracks: [
      {
        part: 'wheel',
        keyframes: [
          { offset: 0, transform: 'rotate(0deg)' },
          { offset: firstLanding, transform: 'rotate(0deg)', easing: TURN_EASING },
          { offset: 0.48, transform: 'rotate(45deg)' },
          { offset: secondLanding, transform: 'rotate(45deg)', easing: TURN_EASING },
          { offset: 0.98, transform: 'rotate(90deg)' },
          { offset: 1, transform: 'rotate(90deg)' },
        ],
      },
      ...coinTracks('coin1', 0.04, firstLanding, 50, -52),
      ...coinTracks('coin2', 0.54, secondLanding, -52, 44),
      ...hubTracks([firstLanding, secondLanding], 0.12),
    ],
  }
}
