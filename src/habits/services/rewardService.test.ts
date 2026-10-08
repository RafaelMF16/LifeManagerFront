import { describe, expect, it } from 'vitest'
import { toRequestDto } from './rewardService'

describe('toRequestDto', () => {
  it('sends the typed cost as a number with the icon', () => {
    expect(toRequestDto({ name: 'Video games', cost: '120', icon: 'gamepad-2' })).toEqual({
      name: 'Video games',
      cost: 120,
      icon: 'gamepad-2',
    })
  })
})
