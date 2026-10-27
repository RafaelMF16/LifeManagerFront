import { describe, expect, it } from 'vitest'
import { TOUR_ARROW_INSET, TOUR_EDGE_MARGIN, TOUR_TARGET_GAP, tourPlacement } from './tourPlacement'

const VIEWPORT = { width: 1280, height: 800 }
const POPOVER = { width: 320, height: 160 }

function rect(left: number, top: number, width = 100, height = 40) {
  return { left, top, width, height }
}

function expectInsideViewport(placement: { top: number; left: number }, viewport = VIEWPORT, popover = POPOVER) {
  expect(placement.left).toBeGreaterThanOrEqual(TOUR_EDGE_MARGIN)
  expect(placement.top).toBeGreaterThanOrEqual(TOUR_EDGE_MARGIN)
  expect(placement.left + popover.width).toBeLessThanOrEqual(viewport.width - TOUR_EDGE_MARGIN)
  expect(placement.top + popover.height).toBeLessThanOrEqual(viewport.height - TOUR_EDGE_MARGIN)
}

describe('tourPlacement', () => {
  it('puts the balloon below the target, centered on it, when there is room', () => {
    const placement = tourPlacement(rect(500, 100), POPOVER, VIEWPORT)
    expect(placement.side).toBe('bottom')
    expect(placement.top).toBe(140 + TOUR_TARGET_GAP)
    expect(placement.left).toBe(550 - 160)
    expect(placement.arrowOffset).toBe(160)
  })

  it('goes above when the target sits near the bottom', () => {
    const placement = tourPlacement(rect(500, 700), POPOVER, VIEWPORT)
    expect(placement.side).toBe('top')
    expect(placement.top).toBe(700 - TOUR_TARGET_GAP - 160)
  })

  it('goes to the right of a target as tall as the screen allows above and below', () => {
    const placement = tourPlacement(rect(100, 150, 200, 520), POPOVER, VIEWPORT)
    expect(placement.side).toBe('right')
    expect(placement.left).toBe(300 + TOUR_TARGET_GAP)
    expect(placement.top).toBe(410 - 80)
    expectInsideViewport(placement)
  })

  it('goes to the left when only the left side has room', () => {
    const placement = tourPlacement(rect(900, 150, 300, 520), POPOVER, VIEWPORT)
    expect(placement.side).toBe('left')
    expect(placement.left).toBe(900 - TOUR_TARGET_GAP - 320)
  })

  it('keeps the balloon inside the screen and points the arrow at the target near an edge', () => {
    const placement = tourPlacement(rect(0, 100, 60, 40), POPOVER, VIEWPORT)
    expect(placement.side).toBe('bottom')
    expect(placement.left).toBe(TOUR_EDGE_MARGIN)
    expect(placement.arrowOffset).toBe(TOUR_ARROW_INSET)
    expectInsideViewport(placement)
  })

  it('points the arrow at the center of the target when the balloon is pinned', () => {
    const placement = tourPlacement(rect(1200, 100, 60, 40), POPOVER, VIEWPORT)
    expect(placement.left).toBe(1280 - TOUR_EDGE_MARGIN - 320)
    expect(placement.left + placement.arrowOffset).toBe(1230)
  })

  it('overlaps a target bigger than the screen, on the side with more room, still on screen', () => {
    const placement = tourPlacement(rect(-50, -100, 1400, 1200), POPOVER, VIEWPORT)
    expect(['bottom', 'top']).toContain(placement.side)
    expectInsideViewport(placement)
  })

  it('pins to the left margin a balloon wider than a phone screen', () => {
    const phone = { width: 320, height: 640 }
    const placement = tourPlacement(rect(100, 100), { width: 400, height: 160 }, phone)
    expect(placement.left).toBe(TOUR_EDGE_MARGIN)
  })
})
