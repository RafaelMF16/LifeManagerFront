/** `sessionStorage` key marking that this tab already reloaded once for a missing chunk. */
export const CHUNK_RELOAD_KEY = 'lm-chunk-reload'

/** What the browsers say when a lazy route's chunk can't be fetched (Chrome, Safari, Firefox). */
const CHUNK_ERROR_MESSAGES = [
  'failed to fetch dynamically imported module',
  'importing a module script failed',
  'error loading dynamically imported module',
]

type MarkStorage = Pick<Storage, 'getItem' | 'setItem'>

/**
 * Whether `error` is a lazy route's chunk failing to load, typically after a deploy: the tab still has the old
 * `index.html`, whose chunk hashes no longer exist on the server.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  if (error.name === 'ChunkLoadError') return true

  const message = error.message.toLowerCase()
  return CHUNK_ERROR_MESSAGES.some((known) => message.includes(known))
}

/**
 * Whether to reload the page for `error`: only a chunk error, and only once per tab session, marked in `storage`
 * (`sessionStorage`). A reload fetches the new `index.html` and its chunks; if the chunk still fails, the error screen
 * shows instead of reloading in a loop. Storage that can't be read or written means no reload, for the same reason.
 */
export function shouldReloadOnce(error: unknown, storage: MarkStorage): boolean {
  if (!isChunkLoadError(error)) return false

  try {
    if (storage.getItem(CHUNK_RELOAD_KEY) !== null) return false
    storage.setItem(CHUNK_RELOAD_KEY, String(Date.now()))
    return true
  } catch {
    return false
  }
}
