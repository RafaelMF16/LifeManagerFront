import { describe, expect, it } from 'vitest'
import { rankingGroupSchema } from './rankingGroupSchema'

describe('rankingGroupSchema', () => {
  it('trims the name', () => {
    expect(rankingGroupSchema.parse({ name: '  Família ' })).toEqual({ name: 'Família' })
  })

  it('refuses an empty name', () => {
    const result = rankingGroupSchema.safeParse({ name: '   ' })
    expect(result.error?.issues[0].message).toBe('habits:ranking.validation.name.required')
  })

  it('refuses a name over 40 characters', () => {
    const result = rankingGroupSchema.safeParse({ name: 'x'.repeat(41) })
    expect(result.error?.issues[0].message).toBe('habits:ranking.validation.name.tooLong')
  })
})
