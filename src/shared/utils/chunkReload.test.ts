import { describe, expect, it } from 'vitest'
import { CHUNK_RELOAD_KEY, CHUNK_RELOAD_WINDOW_MS, isChunkLoadError, shouldReloadOnce } from './chunkReload'

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

  it('does not reload again while the last reload is recent, so a chunk that is really gone cannot loop', () => {
    const storage = memoryStorage()
    shouldReloadOnce(chunkError, storage, 1_000_000)

    expect(shouldReloadOnce(chunkError, storage, 1_000_000 + CHUNK_RELOAD_WINDOW_MS - 1)).toBe(false)
  })

  it('reloads again once the last reload is old, e.g. a later deploy in a tab left open', () => {
    const storage = memoryStorage()
    shouldReloadOnce(chunkError, storage, 1_000_000)

    expect(shouldReloadOnce(chunkError, storage, 1_000_000 + CHUNK_RELOAD_WINDOW_MS)).toBe(true)
    expect(storage.values.get(CHUNK_RELOAD_KEY)).toBe(String(1_000_000 + CHUNK_RELOAD_WINDOW_MS))
  })

  it('treats a mark it cannot read as old', () => {
    const storage = memoryStorage({ [CHUNK_RELOAD_KEY]: 'not-a-time' })

    expect(shouldReloadOnce(chunkError, storage, 1_000_000)).toBe(true)
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
