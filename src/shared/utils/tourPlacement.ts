import type { TourRect, TourSize } from '../types/Tour'

export type TourSide = 'bottom' | 'top' | 'right' | 'left'

/** Where the tour's balloon goes, in viewport pixels. `arrowOffset` runs along the side that faces the target. */
export interface TourPlacement {
  side: TourSide
  top: number
  left: number
  arrowOffset: number
}

/** Space kept between the balloon and the sides of the screen. */
export const TOUR_EDGE_MARGIN = 16
/** Space between the target and the balloon, where the arrow sits. */
export const TOUR_TARGET_GAP = 12
/** How close the arrow may get to a corner of the balloon, so it doesn't poke out of the rounded edge. */
export const TOUR_ARROW_INSET = 16

const SIDES: TourSide[] = ['bottom', 'top', 'right', 'left']

function clamp(value: number, min: number, max: number) {
  // `min` wins when the balloon is wider than the screen, so it pins to the leading edge.
  return Math.max(min, Math.min(value, max))
}

function fits(side: TourSide, target: TourRect, popover: TourSize, viewport: TourSize) {
  switch (side) {
    case 'bottom':
      return target.top + target.height + TOUR_TARGET_GAP + popover.height <= viewport.height - TOUR_EDGE_MARGIN
    case 'top':
      return target.top - TOUR_TARGET_GAP - popover.height >= TOUR_EDGE_MARGIN
    case 'right':
      return target.left + target.width + TOUR_TARGET_GAP + popover.width <= viewport.width - TOUR_EDGE_MARGIN
    case 'left':
      return target.left - TOUR_TARGET_GAP - popover.width >= TOUR_EDGE_MARGIN
  }
}

function place(side: TourSide, target: TourRect, popover: TourSize, viewport: TourSize): TourPlacement {
  const maxLeft = viewport.width - TOUR_EDGE_MARGIN - popover.width
  const maxTop = viewport.height - TOUR_EDGE_MARGIN - popover.height
  const centerX = target.left + target.width / 2
  const centerY = target.top + target.height / 2

  if (side === 'bottom' || side === 'top') {
    const left = clamp(centerX - popover.width / 2, TOUR_EDGE_MARGIN, maxLeft)
    const top =
      side === 'bottom'
        ? target.top + target.height + TOUR_TARGET_GAP
        : target.top - TOUR_TARGET_GAP - popover.height
    return {
      side,
      left,
      top: clamp(top, TOUR_EDGE_MARGIN, maxTop),
      arrowOffset: clamp(centerX - left, TOUR_ARROW_INSET, popover.width - TOUR_ARROW_INSET),
    }
  }

  const top = clamp(centerY - popover.height / 2, TOUR_EDGE_MARGIN, maxTop)
  const left =
    side === 'right' ? target.left + target.width + TOUR_TARGET_GAP : target.left - TOUR_TARGET_GAP - popover.width
  return {
    side,
    top,
    left: clamp(left, TOUR_EDGE_MARGIN, maxLeft),
    arrowOffset: clamp(centerY - top, TOUR_ARROW_INSET, popover.height - TOUR_ARROW_INSET),
  }
}

/**
 * Places the tour's balloon next to its target: below, then above, right and left, the first side with room for it.
 * Along that side it centers on the target and stays `TOUR_EDGE_MARGIN` inside the screen, with the arrow still
 * pointing at the target. A target with no room on any side (bigger than the screen) gets the balloon over it, on
 * whichever of below/above has more space.
 */
export function tourPlacement(target: TourRect, popover: TourSize, viewport: TourSize): TourPlacement {
  const side = SIDES.find((candidate) => fits(candidate, target, popover, viewport))
  if (side) return place(side, target, popover, viewport)

  const spaceBelow = viewport.height - (target.top + target.height)
  return place(spaceBelow >= target.top ? 'bottom' : 'top', target, popover, viewport)
}
