import { describe, expect, it } from 'vitest'
import { HELM_PARTS, helmLoopTimeline, helmReceiveTimeline } from './helmTimeline'
import type { HelmTimeline } from './helmTimeline'

const offsets = (keyframes: Keyframe[]) => keyframes.map((keyframe) => keyframe.offset as number)

const track = (timeline: HelmTimeline, part: string) => {
  const found = timeline.tracks.find((candidate) => candidate.part === part)
  if (!found) throw new Error(`no track for ${part}`)
  return found.keyframes
}

/** The offset where a coin's horizontal path first reaches the hub. */
const arrival = (timeline: HelmTimeline, coin: 'coin1' | 'coin2') =>
  track(timeline, `${coin}X`).find((keyframe) => keyframe.transform === 'translateX(0px)')?.offset as number

describe.each([
  ['loop', helmLoopTimeline()],
  ['receive', helmReceiveTimeline()],
])('the %s timeline', (_name, timeline) => {
  it('only animates parts the helm draws', () => {
    for (const { part } of timeline.tracks) expect(HELM_PARTS).toContain(part)
  })

  it('runs every track over the whole animation, in order', () => {
    for (const { keyframes } of timeline.tracks) {
      const values = offsets(keyframes)
      expect(values[0]).toBe(0)
      expect(values.at(-1)).toBe(1)
      for (let i = 1; i < values.length; i += 1) expect(values[i]).toBeGreaterThanOrEqual(values[i - 1])
    }
  })

  it('lights the hub as the first coin lands in it', () => {
    const glow = track(timeline, 'hubGlow')
    const index = glow.findIndex((keyframe) => keyframe.offset === arrival(timeline, 'coin1'))
    expect(glow[index]?.opacity).toBe(0)
    expect(glow[index + 1]?.opacity).toBe(1)
  })
})

describe('helmLoopTimeline', () => {
  const timeline = helmLoopTimeline()

  it('repeats a 2.6 s cycle forever', () => {
    expect(timeline.durationMs).toBe(2600)
    expect(timeline.iterations).toBe(Infinity)
  })

  it('ends the cycle turned by a whole number of spokes, so the loop has no seam', () => {
    const wheel = track(timeline, 'wheel')
    expect(wheel[0].transform).toBe('rotate(0deg)')
    const degrees = Number(/rotate\((-?\d+)deg\)/.exec(String(wheel.at(-1)?.transform))?.[1])
    expect(degrees).toBeGreaterThan(0)
    expect(degrees % 45).toBe(0)
  })

  it('lights the hub as each coin lands in it', () => {
    const glow = track(timeline, 'hubGlow')
    for (const coin of ['coin1', 'coin2'] as const) {
      const landed = arrival(timeline, coin)
      const index = glow.findIndex((keyframe) => keyframe.offset === landed)
      expect(glow[index]?.opacity).toBe(0)
      expect(glow[index + 1]?.opacity).toBe(1)
    }
  })

  it('turns the helm one spoke from each coin landing', () => {
    const wheel = track(timeline, 'wheel')
    for (const coin of ['coin1', 'coin2'] as const) {
      const landed = arrival(timeline, coin)
      const start = wheel.find((keyframe) => keyframe.offset === landed)
      expect(start).toBeDefined()
      expect(start?.easing).toBeDefined()
    }
  })

  it('brings the coins in from opposite sides', () => {
    const startX = (coin: string) => parseFloat(String(track(timeline, `${coin}X`)[0].transform).slice('translateX('.length))
    expect(Math.sign(startX('coin1'))).toBe(-Math.sign(startX('coin2')))
  })
})

describe('helmReceiveTimeline', () => {
  const timeline = helmReceiveTimeline()
  const at = (ms: number) => ms / timeline.durationMs

  it('plays once, in about 1.75 s', () => {
    expect(timeline.durationMs).toBe(1750)
    expect(timeline.iterations).toBe(1)
  })

  it('holds the helm still before the coin, then turns it a full circle from the landing', () => {
    const wheel = track(timeline, 'wheel')
    const landed = arrival(timeline, 'coin1')
    expect(wheel.find((keyframe) => keyframe.offset === landed)?.transform).toBe('rotate(0deg)')
    expect(wheel.at(-1)?.transform).toBe('rotate(360deg)')
  })

  it('starts the coin after a short still moment', () => {
    const start = track(timeline, 'coin1Scale').find((keyframe) => keyframe.opacity === 1)?.offset as number
    expect(start).toBeGreaterThan(at(100))
  })

  it('brings in a single coin', () => {
    expect(timeline.tracks.some(({ part }) => part.startsWith('coin2'))).toBe(false)
  })

  it('sparkles one after another, once the coin has landed', () => {
    const landed = arrival(timeline, 'coin1')
    const starts = (['spark0', 'spark1', 'spark2', 'spark3'] as const).map(
      (part) => track(timeline, part).find((keyframe) => keyframe.opacity === 1)?.offset as number,
    )
    for (const start of starts) expect(start).toBeGreaterThan(landed)
    for (let i = 1; i < starts.length; i += 1) expect(starts[i]).toBeGreaterThan(starts[i - 1])
  })
})
