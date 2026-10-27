import type { TourRect } from '../types/Tour'

// The tour's only reads of the page. Kept apart from `tourSteps`/`tourPlacement`, which stay pure and tested.

/** The first element marked `data-tour="<target>"` that is laid out (a screen may mark a wide and a compact version). */
export function findTourTarget(target: string): HTMLElement | null {
  const elements = document.querySelectorAll<HTMLElement>(`[data-tour="${CSS.escape(target)}"]`)
  for (const element of elements) {
    const rect = element.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) return element
  }
  return null
}

export function measureTourTarget(target: string): TourRect | null {
  return findTourTarget(target)?.getBoundingClientRect() ?? null
}
