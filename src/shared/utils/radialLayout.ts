/** Where a bubble sits, in px from the center of the menu button: `x` to the right, `y` up. */
export interface RadialSlot {
  x: number
  y: number
}

export const RADIAL_BUBBLE_SIZE = 48
/** Space between two bubbles, so a finger doesn't hit the neighbor. */
const BUBBLE_GAP = 12
/** Space between a bubble and the side of the screen. */
const EDGE_MARGIN = 8
/** Clears the 56px button with a gap of `BUBBLE_GAP`. */
const MIN_RADIUS = 72
const MAX_RADIUS = 200
/** How far below the button's center a bubble may go, so the arc can open a bit past a half circle. */
const LOWEST_Y = -8
const MIN_SPAN = 120
const MAX_SPAN = 200
const SPAN_STEP = 5

function arc(count: number, span: number, radius: number): RadialSlot[] {
  if (count === 1) return [{ x: 0, y: radius }]
  const startDegrees = 90 + span / 2
  return Array.from({ length: count }, (_, index) => {
    const radians = ((startDegrees - (index * span) / (count - 1)) * Math.PI) / 180
    return { x: radius * Math.cos(radians), y: radius * Math.sin(radians) }
  })
}

/** The farthest a bubble's center may sit from the button sideways and still clear the screen's edge. */
function maxOffsetX(viewportWidth: number) {
  return viewportWidth / 2 - EDGE_MARGIN - RADIAL_BUBBLE_SIZE / 2
}

function fits(slots: RadialSlot[], viewportWidth: number) {
  const maxX = maxOffsetX(viewportWidth)
  if (slots.some((slot) => Math.abs(slot.x) > maxX || slot.y < LOWEST_Y)) return false
  // Neighbors are the closest pair on an even arc, so checking them is enough.
  return slots.every(
    (slot, index) =>
      index === 0 ||
      Math.hypot(slot.x - slots[index - 1].x, slot.y - slots[index - 1].y) >= RADIAL_BUBBLE_SIZE + BUBBLE_GAP,
  )
}

/**
 * Lays a module's menu items out as an arc above the menu button, left to right: the smallest radius (then the
 * narrowest opening) where the bubbles keep a finger-sized gap and stay on screen. When no arc keeps that gap (a
 * very narrow screen or many items), the screen wins: a half circle as wide as it allows, with the bubbles closer.
 */
export function radialLayout(count: number, viewportWidth: number): RadialSlot[] {
  for (let radius = MIN_RADIUS; radius <= MAX_RADIUS; radius++) {
    for (let span = MIN_SPAN; span <= MAX_SPAN; span += SPAN_STEP) {
      const slots = arc(count, span, radius)
      if (fits(slots, viewportWidth)) return slots
    }
  }
  return arc(count, 180, maxOffsetX(viewportWidth))
}
