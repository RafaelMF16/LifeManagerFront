import { useEffect, useState } from 'react'
import { getSavingsGoals } from '../services/savingsGoalService'
import type { SavingsGoalResponseDto } from '../types/SavingsGoalDtos'

/** One page of each status is plenty: hardly anyone has 100 goals going. */
const PAGE_SIZE = 100

/**
 * The goals an investment can be linked to: the active ones and the completed ones (a goal past its target still
 * takes investments; only an archived one refuses them). Loaded once `enabled` turns on, i.e. when the transaction
 * form's type is Investment. Null until loaded; a failure leaves an empty list (the field is optional).
 */
export function useLinkableSavingsGoals(enabled: boolean) {
  const [goals, setGoals] = useState<SavingsGoalResponseDto[] | null>(null)
  const shouldLoad = enabled && goals === null

  useEffect(() => {
    if (!shouldLoad) return
    const controller = new AbortController()
    const query = { page: 1, pageSize: PAGE_SIZE, sortBy: 'Name', sortDirection: 'Asc' } as const

    Promise.all([
      getSavingsGoals({ ...query, status: 'Active' }, controller.signal),
      getSavingsGoals({ ...query, status: 'Completed' }, controller.signal),
    ]).then(
      ([active, completed]) => {
        if (!controller.signal.aborted) setGoals([...active.items, ...completed.items])
      },
      () => {
        if (!controller.signal.aborted) setGoals([])
      },
    )

    return () => controller.abort()
  }, [shouldLoad])

  return goals
}
