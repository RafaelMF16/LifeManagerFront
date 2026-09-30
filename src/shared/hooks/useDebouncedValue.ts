import { useEffect, useState } from 'react'

/** Returns `value` only after it has stopped changing for `delayMs` (e.g. to query the API once typing pauses). */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
