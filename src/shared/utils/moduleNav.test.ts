import { describe, expect, it } from 'vitest'
import { isAnyItemActive, splitNavItems } from './moduleNav'

describe('splitNavItems', () => {
  it('keeps every item primary when there are fewer than the limit', () => {
    expect(splitNavItems(['a', 'b'], 3)).toEqual({ primary: ['a', 'b'], overflow: [] })
  })

  it('keeps every item primary when there are exactly the limit', () => {
    expect(splitNavItems(['a', 'b', 'c'], 3)).toEqual({ primary: ['a', 'b', 'c'], overflow: [] })
  })

  it('moves the items past the limit to the overflow, in order', () => {
    expect(splitNavItems(['a', 'b', 'c', 'd', 'e'], 3)).toEqual({ primary: ['a', 'b', 'c'], overflow: ['d', 'e'] })
  })
})

describe('isAnyItemActive', () => {
  const items = [
    { path: '/finance/imports' },
    { path: '/finance/categories' },
    { path: null },
  ]

  it('matches an item on its exact path', () => {
    expect(isAnyItemActive(items, '/finance/categories')).toBe(true)
  })

  it('matches an item on a nested path', () => {
    expect(isAnyItemActive(items, '/finance/imports/abc')).toBe(true)
  })

  it("doesn't match another item's path", () => {
    expect(isAnyItemActive(items, '/finance/months')).toBe(false)
  })

  it("doesn't match a path that only shares a prefix", () => {
    expect(isAnyItemActive(items, '/finance/categoriesX')).toBe(false)
  })

  it('ignores items without a path', () => {
    expect(isAnyItemActive([{ path: null }], '/')).toBe(false)
  })
})
