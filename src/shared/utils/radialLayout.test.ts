import { describe, expect, it } from 'vitest'
import { RADIAL_BUBBLE_SIZE, radialLayout } from './radialLayout'

const WIDTHS = [320, 360, 390, 430]
const COUNTS = [2, 3, 4, 5, 6, 7]

describe('radialLayout', () => {
  it('returns one slot per item', () => {
    expect(radialLayout(6, 360)).toHaveLength(6)
  })

  it('puts a single item straight above the button', () => {
    const [slot] = radialLayout(1, 360)
    expect(slot.x).toBeCloseTo(0)
    expect(slot.y).toBeGreaterThan(0)
  })

  for (const width of WIDTHS) {
    for (const count of COUNTS) {
      describe(`${count} items at ${width}px`, () => {
        const slots = radialLayout(count, width)

        it('keeps a finger-sized gap between bubbles', () => {
          for (let i = 0; i < slots.length; i++) {
            for (let j = i + 1; j < slots.length; j++) {
              const distance = Math.hypot(slots[i].x - slots[j].x, slots[i].y - slots[j].y)
              expect(distance).toBeGreaterThanOrEqual(RADIAL_BUBBLE_SIZE + 12)
            }
          }
        })

        it('keeps every bubble on screen, clear of the side edges and the bottom', () => {
          for (const slot of slots) {
            expect(Math.abs(slot.x) + RADIAL_BUBBLE_SIZE / 2).toBeLessThanOrEqual(width / 2 - 8)
            expect(slot.y).toBeGreaterThanOrEqual(-8)
          }
        })

        it('clears the button in the middle', () => {
          for (const slot of slots) {
            expect(Math.hypot(slot.x, slot.y)).toBeGreaterThanOrEqual(28 + RADIAL_BUBBLE_SIZE / 2 + 12)
          }
        })

        it('runs left to right and mirrors around the button', () => {
          for (let i = 1; i < slots.length; i++) expect(slots[i].x).toBeGreaterThan(slots[i - 1].x)
          const first = slots[0]
          const last = slots[slots.length - 1]
          expect(first.x).toBeCloseTo(-last.x)
          expect(first.y).toBeCloseTo(last.y)
        })
      })
    }
  }

  it('fits the six Finance items within a 110px radius', () => {
    for (const width of WIDTHS) {
      for (const slot of radialLayout(6, width)) expect(Math.hypot(slot.x, slot.y)).toBeLessThanOrEqual(110)
    }
  })
})
