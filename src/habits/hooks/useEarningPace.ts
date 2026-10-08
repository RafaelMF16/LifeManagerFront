import { useEffect, useState } from 'react'
import { getEarningPace } from '../services/rewardService'
import type { EarningPaceDto } from '../types/RewardDtos'

/**
 * The player's recent coins per day, to price rewards in days of habits. Undefined while it loads or when it failed:
 * the shop just leaves the estimate out, it's a hint, not something to retry for.
 */
export function useEarningPace(): EarningPaceDto | undefined {
  const [pace, setPace] = useState<EarningPaceDto>()

  useEffect(() => {
    // Aborted on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    getEarningPace(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setPace(data)
      },
      () => {},
    )

    return () => controller.abort()
  }, [])

  return pace
}
