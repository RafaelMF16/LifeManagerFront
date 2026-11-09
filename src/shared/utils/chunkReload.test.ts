import { describe, expect, it } from 'vitest'
import { CHUNK_RELOAD_KEY, isChunkLoadError, shouldReloadOnce } from './chunkReload'

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
    values,
  }
}

const chunkError = new TypeError('Failed to fetch dynamically imported module: https://app/assets/DashboardPage-abc.js')

describe('isChunkLoadError', () => {
  it.each([
    ['Chrome', new TypeError('Failed to fetch dynamically imported module: https://app/assets/x.js')],
    ['Safari', new TypeError('Importing a module script failed.')],
    ['Firefox', new TypeError('error loading dynamically imported module: https://app/assets/x.js')],
  ])('recognizes the %s message', (_browser, error) => {
    expect(isChunkLoadError(error)).toBe(true)
  })

  it('recognizes an error named ChunkLoadError', () => {
    const error = new Error('Loading chunk 12 failed.')
    error.name = 'ChunkLoadError'

    expect(isChunkLoadError(error)).toBe(true)
  })

  it.each([[new Error('Cannot read properties of undefined')], ['a string'], [null], [{ status: 404 }]])(
    'ignores anything else (%s)',
    (error) => {
      expect(isChunkLoadError(error)).toBe(false)
    },
  )
})

describe('shouldReloadOnce', () => {
  it('reloads on the first chunk error and leaves a mark', () => {
    const storage = memoryStorage()

    expect(shouldReloadOnce(chunkError, storage)).toBe(true)
    expect(storage.values.has(CHUNK_RELOAD_KEY)).toBe(true)
  })

  it('does not reload a second time in the same session', () => {
    const storage = memoryStorage()
    shouldReloadOnce(chunkError, storage)

    expect(shouldReloadOnce(chunkError, storage)).toBe(false)
  })

  it('never reloads for an error that is not a chunk error', () => {
    const storage = memoryStorage()

    expect(shouldReloadOnce(new Error('boom'), storage)).toBe(false)
    expect(storage.values.size).toBe(0)
  })

  it('does not reload when the storage cannot be used, so it can never loop', () => {
    const blocked = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('SecurityError')
      },
    }

    expect(shouldReloadOnce(chunkError, blocked)).toBe(false)
  })
})
