import { describe, expect, it } from 'vitest'
import { notificationUrl, readPushPayload } from './pushPayload'

const ORIGIN = 'https://lifemanager.example'

describe('readPushPayload', () => {
  it('reads the backend notification', () => {
    expect(readPushPayload({ title: 'LifeManager', body: 'Ler: ainda dá tempo hoje', url: '/habits/today', tag: 'habits-2026-11-11-20' })).toEqual({
      title: 'LifeManager',
      body: 'Ler: ainda dá tempo hoje',
      url: '/habits/today',
      tag: 'habits-2026-11-11-20',
    })
  })

  it('falls back to a generic notification for anything else', () => {
    expect(readPushPayload(null)).toEqual({ title: 'LifeManager', body: '', url: '/habits/today', tag: undefined })
    expect(readPushPayload({ title: 7, body: ['x'] })).toEqual({ title: 'LifeManager', body: '', url: '/habits/today', tag: undefined })
  })
})

describe('notificationUrl', () => {
  it('opens a path of the app', () => {
    expect(notificationUrl('/habits/today', ORIGIN)).toBe(`${ORIGIN}/habits/today`)
  })

  it.each(['https://evil.example/phish', '//evil.example/x', 'javascript:alert(1)'])('never leaves the app for %s', (url) => {
    expect(notificationUrl(url, ORIGIN)).toBe(`${ORIGIN}/habits/today`)
  })
})
