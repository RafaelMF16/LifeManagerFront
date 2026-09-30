import { describe, expect, it } from 'vitest'
import { getPageItems } from './getPageItems'

describe('getPageItems', () => {
  it('returns no pages when there are none', () => {
    expect(getPageItems(1, 0)).toEqual([])
  })

  it('lists every page when there are few', () => {
    expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses both sides around a page in the middle', () => {
    expect(getPageItems(10, 20)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20])
  })

  it('only collapses the far side near the start', () => {
    expect(getPageItems(1, 20)).toEqual([1, 2, 'gap', 20])
  })

  it('only collapses the far side near the end', () => {
    expect(getPageItems(20, 20)).toEqual([1, 'gap', 19, 20])
  })

  it('shows a single hidden page instead of a gap', () => {
    expect(getPageItems(4, 20)).toEqual([1, 2, 3, 4, 5, 'gap', 20])
  })
})
