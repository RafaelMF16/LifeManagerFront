import { useCallback, useEffect, useState } from 'react'
import { isApiError } from '../../shared/types/ApiError'
import { getStatementImport } from '../services/statementImportService'
import type { StatementImportDetailsDto } from '../types/StatementImportDtos'
import { STATEMENT_IMPORT_NOT_FOUND_CODE } from '../validation/statementImportErrorMap'

export type StatementImportStatus = 'loading' | 'ready' | 'error' | 'notFound'

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: StatementImportDetailsDto
  failure?: 'error' | 'notFound'
}

/**
 * Loads one import: the draft's months with their counts and totals. `reload` refetches it, e.g. after a row
 * changes (every change can move the counts and totals).
 */
export function useStatementImport(importId: number) {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  const requestKey = JSON.stringify([importId, reloadKey])

  useEffect(() => {
    // Aborted when the import changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([importId, reloadKey])

    getStatementImport(importId, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data })
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        const failure = isApiError(err) && err.code === STATEMENT_IMPORT_NOT_FOUND_CODE ? 'notFound' : 'error'
        setResult((previous) => ({ key, data: previous?.data, failure }))
      },
    )

    return () => controller.abort()
  }, [importId, reloadKey])

  // The previous counts stay on screen while the next ones load, so the page doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const current = result?.key === requestKey ? result : null
  const status: StatementImportStatus = current?.failure ?? (data ? 'ready' : 'loading')

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, status, isFetching, reload }
}
