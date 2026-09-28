import { describe, expect, it } from 'vitest'
import { fromUserPreferencesDto, toUserPreferencesDto } from './userPreferencesMapper'
import type { UserPreferences } from '../types/UserPreferences'

describe('userPreferencesMapper', () => {
  it('maps front values to backend enum names', () => {
    expect(toUserPreferencesDto({ theme: 'light', language: 'pt-BR' })).toEqual({ theme: 'Light', language: 'PTBR' })
    expect(toUserPreferencesDto({ theme: 'dark', language: 'en-US' })).toEqual({ theme: 'Dark', language: 'EN' })
  })

  it('maps backend enum names to front values', () => {
    expect(fromUserPreferencesDto({ theme: 'Light', language: 'PTBR' })).toEqual({ theme: 'light', language: 'pt-BR' })
    expect(fromUserPreferencesDto({ theme: 'Dark', language: 'EN' })).toEqual({ theme: 'dark', language: 'en-US' })
  })

  it('round-trips every combination', () => {
    const combinations: UserPreferences[] = [
      { theme: 'light', language: 'pt-BR' },
      { theme: 'light', language: 'en-US' },
      { theme: 'dark', language: 'pt-BR' },
      { theme: 'dark', language: 'en-US' },
    ]

    for (const preferences of combinations) {
      expect(fromUserPreferencesDto(toUserPreferencesDto(preferences))).toEqual(preferences)
    }
  })
})
