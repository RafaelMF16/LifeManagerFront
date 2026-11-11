import { describe, expect, it } from 'vitest'
import { entranceClass } from './loginEntrance'

describe('entranceClass', () => {
  it('plays nothing on a screen that did not open under the sign-in cover', () => {
    expect(entranceClass(false, null)).toBe('')
    expect(entranceClass(false, 'enter')).toBe('')
  })

  it('keeps the blocks hidden while the cover still hides the screen', () => {
    expect(entranceClass(true, 'hidden')).toBe('lm-enter-pending')
  })

  it('plays the cascade as the cover opens', () => {
    expect(entranceClass(true, 'enter')).toBe('lm-enter')
  })

  it('keeps the cascade class once the cover is gone, so it does not restart', () => {
    expect(entranceClass(true, null)).toBe('lm-enter')
  })
})
