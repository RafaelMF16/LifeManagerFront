import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import type { TourDefinition, TourRect, TourStep } from '../types/Tour'
import { matchTour, resolveSteps } from '../utils/tourSteps'

interface ActiveTour {
  tour: TourDefinition
  steps: TourStep[]
  index: number
  /** The screen and language the tour was started in: leaving the screen or switching language ends it. */
  pathname: string
  language: string
}

/** The first element marked `data-tour="<target>"` that is laid out (a screen may mark a wide and a compact version). */
export function findTourTarget(target: string): HTMLElement | null {
  const elements = document.querySelectorAll<HTMLElement>(`[data-tour="${CSS.escape(target)}"]`)
  for (const element of elements) {
    const rect = element.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) return element
  }
  return null
}

function measureTarget(target: string): TourRect | null {
  return findTourTarget(target)?.getBoundingClientRect() ?? null
}

/**
 * State of the current screen's guided tour: which tour the route has (`null` hides the "?" button), and the open
 * tour's steps, resolved against the page when it starts. Leaving the screen or switching language ends it; the
 * theme doesn't.
 */
export function useTour(tours: TourDefinition[]) {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()
  const tour = matchTour(pathname, tours)
  const [active, setActive] = useState<ActiveTour | null>(null)
  const isCurrent = (candidate: ActiveTour) => candidate.pathname === pathname && candidate.language === i18n.language

  // Ends the tour on another screen (the browser's back) or language, adjusted during render rather than in an effect.
  if (active && !isCurrent(active)) setActive(null)

  function start() {
    if (!tour) return
    setActive({ tour, steps: resolveSteps(tour.steps, measureTarget), index: 0, pathname, language: i18n.language })
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

  const open = active && isCurrent(active) ? active : null

  return {
    tour,
    active: open ? { tour: open.tour, step: open.steps[open.index], index: open.index, count: open.steps.length } : null,
    start,
    next,
    previous,
    close,
  }
}
