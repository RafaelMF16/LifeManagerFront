import { useCallback, useEffect, useState } from 'react'
import { getBudgetMonth, removeBudget as removeRequest, setBudget as setRequest } from '../services/budgetService'
import type { BudgetMonthResponseDto } from '../types/BudgetDtos'
import type { BudgetFormValues } from '../validation/budgetSchema'

export type BudgetMonthStatus = 'loading' | 'ready' | 'error'

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: BudgetMonthResponseDto
  failed?: boolean
}

/**
 * The goals in force in `month` (`yyyy-MM`) with their actual amounts. Setting or removing a goal reloads the month,
 * since the change can also reach this month. `refreshKey` refetches it when something else moved its actual amounts
 * (e.g. a transaction saved on the month details page).
 */
export function useBudgetMonth(month: string, refreshKey = 0) {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  const requestKey = JSON.stringify([month, reloadKey, refreshKey])

  useEffect(() => {
    // Aborted when the month changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([month, reloadKey, refreshKey])

    getBudgetMonth(month, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [month, reloadKey, refreshKey])

  // The previous month stays on screen while the next one loads, so the page doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const current = result?.key === requestKey ? result : null
  const status: BudgetMonthStatus = current?.failed ? 'error' : data ? 'ready' : 'loading'

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const setBudget = useCallback(
    async (values: BudgetFormValues) => {
      await setRequest(values)
      reload()
    },
    [reload],
  )

  const removeBudget = useCallback(
    async (id: number, fromMonth: string) => {
      await removeRequest(id, fromMonth)
      reload()
    },
    [reload],
  )

  return { data, status, isFetching, reload, setBudget, removeBudget }
}
