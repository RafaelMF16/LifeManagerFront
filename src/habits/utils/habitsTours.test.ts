import { describe, expect, it } from 'vitest'
import enUS from '../locales/en-US'
import ptBR from '../locales/pt-BR'
import { HABITS_TOURS } from './habitsTours'

type TourCopy = Record<string, Record<string, { title?: string; body?: string }>>

const LOCALES: [string, TourCopy][] = [
  ['pt-BR', ptBR.tour as TourCopy],
  ['en-US', enUS.tour as TourCopy],
]

describe('HABITS_TOURS', () => {
  it('uses each tour id and each screen once', () => {
    expect(new Set(HABITS_TOURS.map((tour) => tour.id)).size).toBe(HABITS_TOURS.length)
    expect(new Set(HABITS_TOURS.map((tour) => tour.path)).size).toBe(HABITS_TOURS.length)
  })

  for (const tour of HABITS_TOURS) {
    describe(tour.id, () => {
      it('starts with a centered intro and points every other step at an element', () => {
        expect(tour.steps[0]).toEqual({ id: 'intro' })
        for (const step of tour.steps.slice(1)) expect(step.target).toBeTruthy()
      })

      it('uses each step id once', () => {
        expect(new Set(tour.steps.map((step) => step.id)).size).toBe(tour.steps.length)
      })

      for (const [language, copy] of LOCALES) {
        it(`has a title and a body for every step in ${language}`, () => {
          for (const step of tour.steps) {
            expect(copy[tour.id]?.[step.id]?.title, `${tour.id}.${step.id}.title`).toBeTruthy()
            expect(copy[tour.id]?.[step.id]?.body, `${tour.id}.${step.id}.body`).toBeTruthy()
          }
        })
      }
    })
  }
})
