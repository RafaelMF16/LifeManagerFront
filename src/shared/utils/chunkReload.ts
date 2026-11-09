/** `sessionStorage` key holding when this tab last reloaded for a missing chunk (ms since the epoch). */
export const CHUNK_RELOAD_KEY = 'lm-chunk-reload'

/**
 * How long a reload counts as "just done". Within it a chunk that still fails is really gone and the error screen
 * shows; after it, a new chunk error is a later deploy (a tab left open for days) and reloads again.
 */
export const CHUNK_RELOAD_WINDOW_MS = 5 * 60 * 1000

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
 * Whether to reload the page for `error`: only a chunk error, and at most once per `CHUNK_RELOAD_WINDOW_MS`, marked in
 * `storage` (`sessionStorage`). A reload fetches the new `index.html` and its chunks; if the chunk still fails right
 * after, the error screen shows instead of reloading in a loop. Storage that can't be read or written means no reload,
 * for the same reason; a mark that isn't a time counts as old.
 */
export function shouldReloadOnce(error: unknown, storage: MarkStorage, now = Date.now()): boolean {
  if (!isChunkLoadError(error)) return false

  try {
    const lastReload = Number(storage.getItem(CHUNK_RELOAD_KEY) ?? Number.NaN)
    if (Number.isFinite(lastReload) && now - lastReload < CHUNK_RELOAD_WINDOW_MS) return false
    storage.setItem(CHUNK_RELOAD_KEY, String(now))
    return true
  } catch {
    return false
  }
}
