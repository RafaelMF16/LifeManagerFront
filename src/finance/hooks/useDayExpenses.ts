import { useEffect, useState } from 'react'
import type { PagedResponse } from '../../shared/types/Paging'
import { getTransactions } from '../services/transactionService'
import type { TransactionResponseDto } from '../types/TransactionDtos'

export type DayExpensesStatus = 'loading' | 'ready' | 'error'

/** How many of a day's expenses fit on one page of the panel. */
export const DAY_EXPENSES_PAGE_SIZE = 20

interface FetchResult {
  key: string
  data?: PagedResponse<TransactionResponseDto>
  failed?: boolean
}

/**
 * One day's expenses, biggest first, through the month's transactions listing. The caller keys it by day, so a new
 * day starts on its first page.
 */
export function useDayExpenses(monthlySummaryId: number, date: string) {
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  const requestKey = JSON.stringify([monthlySummaryId, date, page, reloadKey])

  useEffect(() => {
    const controller = new AbortController()
    const key = JSON.stringify([monthlySummaryId, date, page, reloadKey])

    // Amount sorts by the signed value and expenses are negative, so ascending puts the biggest first.
    getTransactions(
      monthlySummaryId,
      {
        page,
        pageSize: DAY_EXPENSES_PAGE_SIZE,
        type: 'Expense',
        categoryId: null,
        date,
        sortBy: 'Amount',
        sortDirection: 'Asc',
      },
      controller.signal,
    ).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [monthlySummaryId, date, page, reloadKey])

  // The previous page stays on screen while the next one loads.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const current = result?.key === requestKey ? result : null
  const status: DayExpensesStatus = current?.failed ? 'error' : data ? 'ready' : 'loading'

  return { data, status, isFetching, page, setPage, reload: () => setReloadKey((key) => key + 1) }
}
