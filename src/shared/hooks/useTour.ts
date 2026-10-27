import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { TourDefinition, TourStep } from '../types/Tour'
import { measureTourTarget } from '../utils/tourTarget'
import { matchTour, resolveSteps } from '../utils/tourSteps'

interface ActiveTour {
  tour: TourDefinition
  steps: TourStep[]
  index: number
  /** The screen the tour was started on: leaving it ends the tour. */
  pathname: string
}

/**
 * State of the current screen's guided tour: which tour the route has (`null` hides the "?" button), and the open
 * tour's steps, resolved against the page when it starts. Leaving the screen (the browser's back) ends it; nothing
 * else can change under it, since the open tour takes every click, the header's menu included.
 */
export function useTour(tours: TourDefinition[]) {
  const { pathname } = useLocation()
  const tour = matchTour(pathname, tours)
  const [active, setActive] = useState<ActiveTour | null>(null)

  // Ends the tour on another screen, adjusted during render rather than in an effect: React discards this render and
  // runs the component again at once, so the old screen's tour never reaches the overlay.
  if (active && active.pathname !== pathname) setActive(null)

  function start() {
    if (!tour) return
    setActive({ tour, steps: resolveSteps(tour.steps, measureTourTarget), index: 0, pathname })
  }

  function next() {
    setActive((current) => {
      if (!current) return null
      return current.index + 1 < current.steps.length ? { ...current, index: current.index + 1 } : null
    })
  }

  function previous() {
    setActive((current) => (current && current.index > 0 ? { ...current, index: current.index - 1 } : current))
  }

  function close() {
    setActive(null)
  }

  return {
    tour,
    active: active
      ? { tour: active.tour, step: active.steps[active.index], index: active.index, count: active.steps.length }
      : null,
    start,
    next,
    previous,
    close,
  }
}
