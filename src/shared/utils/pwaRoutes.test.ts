import { describe, expect, it } from 'vitest'
import { isAppNavigation } from './pwaRoutes'

const origin = 'https://lifemanager.example'
const at = (path: string) => new URL(path, origin)

describe('isAppNavigation', () => {
  it('aceita as telas do app, com ou sem query', () => {
    for (const path of ['/', '/home', '/finance/months?new=1', '/habits/list/12', '/invite/ABC23456', '/auth/reset-password?token=x'])
      expect(isAppNavigation(at(path), origin)).toBe(true)
  })

  it('recusa a API, mesmo com outra caixa', () => {
    expect(isAppNavigation(at('/api/Users/Me'), origin)).toBe(false)
    expect(isAppNavigation(at('/api'), origin)).toBe(false)
    expect(isAppNavigation(at('/API/Users/Me'), origin)).toBe(false)
  })

  it('recusa arquivos (com extensão)', () => {
    for (const path of ['/sw.js', '/manifest.webmanifest', '/icons/icon-192.png', '/assets/index-abc.js', '/favicon.svg'])
      expect(isAppNavigation(at(path), origin)).toBe(false)
  })

  it('recusa outra origem', () => {
    expect(isAppNavigation(new URL('https://fonts.googleapis.com/css2'), origin)).toBe(false)
  })
})

