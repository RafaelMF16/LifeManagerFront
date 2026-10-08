import { useCallback, useEffect, useState } from 'react'
import type { PagedResponse } from '../../shared/types/Paging'
import { getRedemptions, undoRedemption as undoRequest } from '../services/rewardService'
import type { RewardRedemptionDto, RewardRedemptionResultDto } from '../types/RewardDtos'

export type RedemptionsStatus = 'loading' | 'ready' | 'error'

const PAGE_SIZE = 15

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: PagedResponse<RewardRedemptionDto>
  failed: boolean
}

/** Owns the redemption history (newest first, paged on the server). An undo refetches the current page. */
export function useRedemptions() {
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  const requestKey = JSON.stringify([page, reloadKey])

  useEffect(() => {
    // Aborted on a page change, a reload or unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([page, reloadKey])

    getRedemptions(page, PAGE_SIZE, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data, failed: false })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [page, reloadKey])

  // The last successful page stays on screen while the next one loads, so the list doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const status: RedemptionsStatus = result?.key === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const undoRedemption = useCallback(
    async (id: number): Promise<RewardRedemptionResultDto> => {
      const undone = await undoRequest(id)
      reload()
      return undone
    },
    [reload],
  )

  return { data, status, isFetching, setPage, reload, undoRedemption }
}
