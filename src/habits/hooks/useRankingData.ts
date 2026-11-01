import { useCallback, useEffect, useState } from 'react'
import { isApiError } from '../../shared/types/ApiError'
import { getGroupRanking, getRankingGroup, getRankingGroups } from '../services/rankingService'
import type { GroupRankingDto, RankingGroupDetailsDto, RankingGroupListItemDto } from '../types/RankingDtos'

export type RankingDataStatus = 'loading' | 'ready' | 'error'

interface FetchResult<T> {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  requestKey: string
  data?: T
  /** The backend's error code when it refused (e.g. a group the user isn't in). */
  errorCode?: string
  failed: boolean
}

/**
 * One read keyed by `key` (it reloads when the key changes or on `reload`). The last answer stays on screen while the
 * next one loads; `replace` swaps it for one a mutation already returned.
 */
function useKeyedFetch<T>(key: string, load: (signal: AbortSignal) => Promise<T>) {
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState<FetchResult<T> | null>(null)
  const requestKey = `${key}#${reloadCount}`

  useEffect(() => {
    // Aborted on reload or unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ requestKey, data, failed: false })
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        const errorCode = isApiError(err) ? err.code : undefined
        // Another key's answer isn't kept: it would show the wrong group or week under the error.
        setResult((previous) => ({
          requestKey,
          data: previous?.requestKey.startsWith(`${key}#`) ? previous.data : undefined,
          errorCode,
          failed: true,
        }))
      },
    )

    return () => controller.abort()
    // `load` is rebuilt every render; `requestKey` already says when to read again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const sameKey = result?.requestKey.startsWith(`${key}#`) ?? false
  const data = sameKey ? result?.data : undefined
  const current = result?.requestKey === requestKey
  const status: RankingDataStatus = current && result?.failed ? 'error' : data ? 'ready' : 'loading'

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])
  const replace = useCallback(
    (update: (previous: T) => T) =>
      setResult((previous) => (previous?.data ? { ...previous, data: update(previous.data) } : previous)),
    [],
  )

  return { data, status, isFetching: !current, errorCode: current ? result?.errorCode : undefined, reload, replace }
}

/** The user's groups, with their place in each this week. */
export function useRankingGroups() {
  return useKeyedFetch<RankingGroupListItemDto[]>('groups', (signal) => getRankingGroups(signal))
}

/** A group and its members; `errorCode` is `RankingGroups.NotFound` when the user isn't in it (anymore). */
export function useRankingGroup(groupId: number) {
  return useKeyedFetch<RankingGroupDetailsDto>(`group-${groupId}`, (signal) => getRankingGroup(groupId, signal))
}

/** A group's ranking in a week (`null` = the current one). */
export function useGroupRanking(groupId: number, weekStart: string | null) {
  return useKeyedFetch<GroupRankingDto>(`ranking-${groupId}-${weekStart ?? 'current'}`, (signal) =>
    getGroupRanking(groupId, weekStart, signal),
  )
}
