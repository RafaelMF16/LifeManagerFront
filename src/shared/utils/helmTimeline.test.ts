import { describe, expect, it } from 'vitest'
import { HELM_PARTS, helmLoopTimeline } from './helmTimeline'
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

describe('helmLoopTimeline', () => {
  const timeline = helmLoopTimeline()

  it('repeats a 2.6 s cycle forever', () => {
    expect(timeline.durationMs).toBe(2600)
    expect(timeline.iterations).toBe(Infinity)
  })

  it('only animates parts the helm draws', () => {
    for (const { part } of timeline.tracks) expect(HELM_PARTS).toContain(part)
  })

  it('runs every track over the whole cycle, in order', () => {
    for (const { keyframes } of timeline.tracks) {
      const values = offsets(keyframes)
      expect(values[0]).toBe(0)
      expect(values.at(-1)).toBe(1)
      for (let i = 1; i < values.length; i += 1) expect(values[i]).toBeGreaterThanOrEqual(values[i - 1])
    }
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
