import { useCallback, useEffect, useState } from 'react'
import { isApiError } from '../../shared/types/ApiError'
import type { PagedResponse } from '../../shared/types/Paging'
import { getSavingsGoal, getSavingsGoalTransactions } from '../services/savingsGoalService'
import type { SavingsGoalResponseDto, SavingsGoalTransactionDto } from '../types/SavingsGoalDtos'
import { SAVINGS_GOAL_NOT_FOUND_CODE } from '../validation/savingsGoalErrorMap'

export type SavingsGoalStatus = 'loading' | 'ready' | 'error' | 'notFound'
export type SavingsGoalTransactionsStatus = 'loading' | 'ready' | 'error'

const TRANSACTIONS_PAGE_SIZE = 10

interface GoalResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: SavingsGoalResponseDto
  failure?: 'error' | 'notFound'
}

interface TransactionsResult {
  key: string
  data?: PagedResponse<SavingsGoalTransactionDto>
  failed: boolean
}

/**
 * One goal for its details page: the goal with its last 12 months, and its linked transactions across months
 * (paged, newest first). `reload` refetches both, e.g. after the goal is edited, archived or restored.
 */
export function useSavingsGoal(goalId: number) {
  const [reloadKey, setReloadKey] = useState(0)
  const [goalResult, setGoalResult] = useState<GoalResult | null>(null)
  const [transactionsResult, setTransactionsResult] = useState<TransactionsResult | null>(null)
  // The page belongs to the goal it was chosen for: another goal starts on page 1.
  const [pageState, setPageState] = useState({ page: 1, goalId })
  const page = pageState.goalId === goalId ? pageState.page : 1

  const goalKey = JSON.stringify([goalId, reloadKey])
  const transactionsKey = JSON.stringify([goalId, page, reloadKey])

  useEffect(() => {
    if (!Number.isInteger(goalId)) return
    const controller = new AbortController()
    const key = JSON.stringify([goalId, reloadKey])

    getSavingsGoal(goalId, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setGoalResult({ key, data })
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        const failure = isApiError(err) && err.code === SAVINGS_GOAL_NOT_FOUND_CODE ? 'notFound' : 'error'
        setGoalResult((previous) => ({ key, data: previous?.data, failure }))
      },
    )

    return () => controller.abort()
  }, [goalId, reloadKey])

  useEffect(() => {
    if (!Number.isInteger(goalId)) return
    const controller = new AbortController()
    const key = JSON.stringify([goalId, page, reloadKey])

    getSavingsGoalTransactions(goalId, page, TRANSACTIONS_PAGE_SIZE, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        if (data.items.length === 0 && data.totalPages > 0 && data.page > data.totalPages) {
          setPageState({ page: data.totalPages, goalId })
          return
        }
        setTransactionsResult({ key, data, failed: false })
      },
      () => {
        if (!controller.signal.aborted) setTransactionsResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [goalId, page, reloadKey])

  // What was on screen stays while the next request loads, so the page doesn't flash.
  const goal = goalResult?.data
  const currentGoal = goalResult?.key === goalKey ? goalResult : null
  const status: SavingsGoalStatus = currentGoal?.failure ?? (goal ? 'ready' : 'loading')

  const transactions = transactionsResult?.data
  const transactionsFetching = transactionsResult?.key !== transactionsKey
  const transactionsStatus: SavingsGoalTransactionsStatus =
    transactionsResult?.key === transactionsKey && transactionsResult.failed ? 'error' : transactions ? 'ready' : 'loading'

  const setPage = useCallback((nextPage: number) => setPageState({ page: nextPage, goalId }), [goalId])
  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { goal, status, transactions, transactionsStatus, transactionsFetching, setPage, reload }
}
