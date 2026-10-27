import { describe, expect, it } from 'vitest'
import type { TourDefinition, TourRect } from '../types/Tour'
import { matchTour, resolveSteps } from './tourSteps'

const STEPS = [{ id: 'intro' }, { id: 'create', target: 'months.create' }, { id: 'list', target: 'months.list' }]

function measureFrom(rects: Record<string, TourRect>) {
  return (target: string) => rects[target] ?? null
}

describe('resolveSteps', () => {
  it('keeps every step whose target is on screen, in order', () => {
    const measure = measureFrom({
      'months.create': { top: 0, left: 0, width: 80, height: 32 },
      'months.list': { top: 100, left: 0, width: 600, height: 300 },
    })
    expect(resolveSteps(STEPS, measure).map((step) => step.id)).toEqual(['intro', 'create', 'list'])
  })

  it('drops a step whose target is missing, such as the row of an empty list', () => {
    const measure = measureFrom({ 'months.create': { top: 0, left: 0, width: 80, height: 32 } })
    expect(resolveSteps(STEPS, measure).map((step) => step.id)).toEqual(['intro', 'create'])
  })

  it('drops a step whose target is hidden (no size)', () => {
    const measure = measureFrom({
      'months.create': { top: 0, left: 0, width: 0, height: 0 },
      'months.list': { top: 100, left: 0, width: 600, height: 300 },
    })
    expect(resolveSteps(STEPS, measure).map((step) => step.id)).toEqual(['intro', 'list'])
  })

  it('always keeps the centered intro', () => {
    expect(resolveSteps(STEPS, () => null).map((step) => step.id)).toEqual(['intro'])
  })
})

describe('matchTour', () => {
  const tours: TourDefinition[] = [
    { id: 'months', path: '/finance/months', namespace: 'finance', steps: STEPS },
    { id: 'monthDetails', path: '/finance/months/:monthlySummaryId', namespace: 'finance', steps: STEPS },
  ]

  it('finds the tour of a screen', () => {
    expect(matchTour('/finance/months', tours)?.id).toBe('months')
  })

  it('tells a screen with a parameter apart from its parent', () => {
    expect(matchTour('/finance/months/42', tours)?.id).toBe('monthDetails')
  })

  it('accepts a trailing slash', () => {
    expect(matchTour('/finance/months/', tours)?.id).toBe('months')
  })

  it('returns null for a screen without a tour', () => {
    expect(matchTour('/finance/categories', tours)).toBeNull()
  })
})
