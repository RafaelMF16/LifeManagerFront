import { describe, expect, it } from 'vitest'
import { REWARD_MAX_COST, REWARD_NAME_MAX_LENGTH, rewardSchema } from './rewardSchema'

const valid = { name: 'Video games', cost: '50', icon: 'gift' }

function messages(values: Record<string, unknown>) {
  const result = rewardSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe('rewardSchema', () => {
  it('accepts a named reward with a whole cost', () => {
    expect(rewardSchema.safeParse(valid).success).toBe(true)
  })

  it('trims the name and the cost', () => {
    const parsed = rewardSchema.parse({ ...valid, name: '  Nap ', cost: ' 10 ' })

    expect(parsed.name).toBe('Nap')
    expect(parsed.cost).toBe('10')
  })

  it('requires a name of at most 60 characters', () => {
    expect(messages({ ...valid, name: '   ' })).toEqual(['habits:shop.validation.name.required'])
    expect(messages({ ...valid, name: 'a'.repeat(REWARD_NAME_MAX_LENGTH + 1) })).toEqual(['habits:shop.validation.name.tooLong'])
  })

  it.each(['', '0', '-5', '1.5', '10,5', 'abc', String(REWARD_MAX_COST + 1)])('rejects the cost "%s"', (cost) => {
    expect(messages({ ...valid, cost })).toEqual(['habits:shop.validation.cost.invalid'])
  })

  it.each(['1', String(REWARD_MAX_COST)])('accepts the cost limit %s', (cost) => {
    expect(rewardSchema.safeParse({ ...valid, cost }).success).toBe(true)
  })

  it('only takes a known icon', () => {
    expect(rewardSchema.safeParse({ ...valid, icon: 'rocket' }).success).toBe(false)
  })
})
