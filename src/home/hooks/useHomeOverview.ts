import { useCallback, useEffect, useRef, useState } from 'react'
import { getHomeOverview } from '../services/homeService'
import type { HomeOverviewDto } from '../types/HomeOverview'
import { localDateKey } from '../utils/greeting'

export type HomeOverviewStatus = 'loading' | 'ready' | 'error'

/**
 * The Home's summary. Loads on mount and again when the tab comes back on another day (a phone left on the Home
 * overnight). A failed reload keeps what was on screen; only a first load that fails is an error.
 */
export function useHomeOverview() {
  const [data, setData] = useState<HomeOverviewDto | null>(null)
  const [failed, setFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const loadedOn = useRef<string | null>(null)

  useEffect(() => {
    // Aborted on reload or unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    getHomeOverview(controller.signal).then(
      (overview) => {
        if (controller.signal.aborted) return
        loadedOn.current = localDateKey(new Date())
        setData(overview)
        setFailed(false)
      },
      () => {
        if (!controller.signal.aborted) setFailed(true)
      },
    )

    return () => controller.abort()
  }, [reloadKey])

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState !== 'visible') return
      if (loadedOn.current !== null && loadedOn.current !== localDateKey(new Date())) setReloadKey((key) => key + 1)
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  const retry = useCallback(() => {
    setFailed(false)
    setReloadKey((key) => key + 1)
  }, [])

  const status: HomeOverviewStatus = data ? 'ready' : failed ? 'error' : 'loading'

  return { data, status, retry }
}
