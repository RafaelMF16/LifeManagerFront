import { describe, expect, it } from 'vitest'
import { floatingPopupPosition } from './floatingPopup'

const viewport = { width: 1280, height: 800 }
const anchor = { top: 100, bottom: 132, left: 600, width: 160 }

describe('floatingPopupPosition', () => {
  it('opens below the field, at least as wide as the minimum', () => {
    expect(floatingPopupPosition(anchor, viewport, { preferredHeight: 264, minWidth: 220 })).toEqual({
      placement: 'below',
      top: 136,
      left: 600,
      width: 220,
      maxHeight: 264,
    })
  })

  it('keeps the field width when it is wider than the minimum', () => {
    const wide = { ...anchor, width: 300 }

    expect(floatingPopupPosition(wide, viewport, { preferredHeight: 264, minWidth: 220 }).width).toBe(300)
  })

  it('flips above when there is more room above than below', () => {
    const low = { top: 700, bottom: 732, left: 600, width: 160 }

    expect(floatingPopupPosition(low, viewport, { preferredHeight: 264, minWidth: 220 })).toEqual({
      placement: 'above',
      bottom: 104,
      left: 600,
      width: 220,
      maxHeight: 264,
    })
  })

  it('stays below and shrinks when below still has more room than above', () => {
    const position = floatingPopupPosition({ ...anchor, top: 250, bottom: 282 }, { width: 1280, height: 600 }, {
      preferredHeight: 400,
      minWidth: 220,
    })

    expect(position).toMatchObject({ placement: 'below', top: 286, maxHeight: 306 })
  })

  it('stays below when both sides have the same room', () => {
    // A field at 200–232 in a 432-tall viewport has 188 free above it and 188 below.
    const middle = { ...anchor, top: 200, bottom: 232 }

    expect(floatingPopupPosition(middle, { width: 1280, height: 432 }, { preferredHeight: 264, minWidth: 220 }).placement).toBe(
      'below',
    )
  })

  it('stays inside the viewport horizontally', () => {
    const right = { ...anchor, left: 1200 }
    const left = { ...anchor, left: -20 }

    expect(floatingPopupPosition(right, viewport, { preferredHeight: 264, minWidth: 220 }).left).toBe(1052)
    expect(floatingPopupPosition(left, viewport, { preferredHeight: 264, minWidth: 220 }).left).toBe(8)
  })

  it('never gets wider than the viewport minus its margins', () => {
    const phone = { width: 360, height: 700 }

    expect(floatingPopupPosition({ ...anchor, left: 16, width: 400 }, phone, { preferredHeight: 264, minWidth: 220 })).toMatchObject({
      left: 8,
      width: 344,
    })
  })
})
