import { describe, expect, it } from 'vitest'
import enUS from '../locales/en-US'
import ptBR from '../locales/pt-BR'
import { appearanceErrorMessages } from './appearanceErrorMap'

function lookup(locale: unknown, key: string) {
  return key
    .replace('habits:', '')
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], locale)
}

describe('appearanceErrorMessages', () => {
  it('explains every refusal in both languages', () => {
    expect(Object.keys(appearanceErrorMessages)).toHaveLength(2)
    for (const key of Object.values(appearanceErrorMessages)) {
      expect(typeof lookup(ptBR, key)).toBe('string')
      expect(typeof lookup(enUS, key)).toBe('string')
    }
  })
})
