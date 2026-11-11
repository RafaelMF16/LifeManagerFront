/** Space between the field and its popup. */
const GAP = 4
/** Space kept between the popup and the viewport's edges. */
const VIEWPORT_MARGIN = 8

export interface FloatingAnchor {
  top: number
  bottom: number
  left: number
  width: number
}

export type FloatingPopupPosition =
  | { placement: 'below'; top: number; left: number; width: number; maxHeight: number }
  | { placement: 'above'; bottom: number; left: number; width: number; maxHeight: number }

/**
 * Where a popup floating over the page (`position: fixed`) goes for a field at `anchor` (its viewport rect): below
 * it, or above when the room below is too short and there is more room above; as wide as the field (at least
 * `minWidth`), kept inside the viewport, and as tall as `preferredHeight` allows.
 */
export function floatingPopupPosition(
  anchor: FloatingAnchor,
  viewport: { width: number; height: number },
  { preferredHeight, minWidth }: { preferredHeight: number; minWidth: number },
): FloatingPopupPosition {
  const width = Math.min(Math.max(anchor.width, minWidth), viewport.width - VIEWPORT_MARGIN * 2)
  const left = Math.min(Math.max(anchor.left, VIEWPORT_MARGIN), viewport.width - width - VIEWPORT_MARGIN)

  const spaceBelow = viewport.height - anchor.bottom - GAP - VIEWPORT_MARGIN
  const spaceAbove = anchor.top - GAP - VIEWPORT_MARGIN

  if (spaceBelow >= preferredHeight || spaceBelow >= spaceAbove) {
    return { placement: 'below', top: anchor.bottom + GAP, left, width, maxHeight: Math.min(preferredHeight, spaceBelow) }
  }

  return {
    placement: 'above',
    bottom: viewport.height - anchor.top + GAP,
    left,
    width,
    maxHeight: Math.min(preferredHeight, spaceAbove),
  }
}
