import { matchPath } from 'react-router-dom'
import type { TourDefinition, TourRect, TourStep } from '../types/Tour'

/**
 * The steps a tour shows right now: the centered ones always, and those whose target is on the page with a size.
 * A section that didn't render (an empty list, a card without data) drops out, so the "Step X of N" count stays
 * true. `measure` returns the target's box, or `null` when it isn't in the page.
 */
export function resolveSteps(steps: TourStep[], measure: (target: string) => TourRect | null): TourStep[] {
  return steps.filter((step) => {
    if (!step.target) return true
    const rect = measure(step.target)
    return rect !== null && rect.width > 0 && rect.height > 0
  })
}

/** The tour of the screen at `pathname`, or `null` when it has none (the "?" button then hides). */
export function matchTour(pathname: string, tours: TourDefinition[]): TourDefinition | null {
  return tours.find((tour) => matchPath({ path: tour.path, end: true }, pathname)) ?? null
}
