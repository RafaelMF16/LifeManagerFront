import { describe, expect, it } from 'vitest'
import { donutArcPath, donutSegments } from './donutGeometry'

describe('donutSegments', () => {
  it('lays the shares around the circle clockwise from the top, ending at 360°', () => {
    expect(donutSegments([30, 25, 20, 25])).toEqual([
      { startAngle: 0, endAngle: 108 },
      { startAngle: 108, endAngle: 198 },
      { startAngle: 198, endAngle: 270 },
      { startAngle: 270, endAngle: 360 },
    ])
  })

  it('gives an empty share an empty segment', () => {
    expect(donutSegments([0, 100])).toEqual([
      { startAngle: 0, endAngle: 0 },
      { startAngle: 0, endAngle: 360 },
    ])
  })
})

describe('donutArcPath', () => {
  const NUMBER = /-?\d+(\.\d+)?/g

  function numbersOf(path: string) {
    return (path.match(NUMBER) ?? []).map(Number)
  }

  it('draws a ring sector from the outer arc back along the inner one', () => {
    const path = donutArcPath(50, 50, 40, 28, 0, 90)

    expect(path.startsWith('M 50 10')).toBe(true)
    expect(path).toContain('A 40 40 0 0 1 90 50')
    expect(path).toContain('A 28 28 0 0 0 50 22')
    expect(path.endsWith('Z')).toBe(true)
  })

  it('flags the large arc past 180°', () => {
    expect(donutArcPath(50, 50, 40, 28, 0, 270)).toContain('A 40 40 0 1 1')
  })

  it('draws a whole ring for a 100% share, which a single arc cannot', () => {
    const path = donutArcPath(50, 50, 40, 28, 0, 360)

    expect(path.match(/A /g)).toHaveLength(4)
    expect(numbersOf(path).every(Number.isFinite)).toBe(true)
  })

  it('draws a valid sliver for a tiny share', () => {
    const path = donutArcPath(50, 50, 40, 28, 0, 0.036)

    expect(numbersOf(path).every(Number.isFinite)).toBe(true)
    expect(path).not.toContain('NaN')
  })

  it('draws nothing for an empty share', () => {
    expect(donutArcPath(50, 50, 40, 28, 90, 90)).toBe('')
  })
})
