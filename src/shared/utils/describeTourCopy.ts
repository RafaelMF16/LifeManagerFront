import { describe, expect, it } from 'vitest'
import type { TourDefinition } from '../types/Tour'

type TourCopy = Record<string, Record<string, { title?: string; body?: string }> | undefined>

/**
 * Test suite for a module's tours (used from its `*Tours.test.ts`): an intro first, a target on every other step,
 * unique ids and screens, and a title and a body for every step in each language, so no tour ships with missing copy.
 */
export function describeTourCopy(name: string, tours: TourDefinition[], locales: Record<string, { tour: unknown }>) {
  describe(name, () => {
    it('uses each tour id and each screen once', () => {
      expect(new Set(tours.map((tour) => tour.id)).size).toBe(tours.length)
      expect(new Set(tours.map((tour) => tour.path)).size).toBe(tours.length)
    })

    for (const tour of tours) {
      describe(tour.id, () => {
        it('starts with a centered intro and points every other step at an element', () => {
          expect(tour.steps[0]).toEqual({ id: 'intro' })
          for (const step of tour.steps.slice(1)) expect(step.target).toBeTruthy()
        })

        it('uses each step id once', () => {
          expect(new Set(tour.steps.map((step) => step.id)).size).toBe(tour.steps.length)
        })

        for (const [language, locale] of Object.entries(locales)) {
          it(`has a title and a body for every step in ${language}`, () => {
            const copy = (locale.tour as TourCopy)[tour.id]
            for (const step of tour.steps) {
              expect(copy?.[step.id]?.title, `${tour.id}.${step.id}.title`).toBeTruthy()
              expect(copy?.[step.id]?.body, `${tour.id}.${step.id}.body`).toBeTruthy()
            }
          })
        }
      })
    }
  })
}
