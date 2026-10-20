import { useCallback, useEffect, useState } from 'react'
import type { PagedResponse } from '../../shared/types/Paging'
import { deleteStatementImport, getStatementImports } from '../services/statementImportService'
import type { StatementImportResponseDto } from '../types/StatementImportDtos'

export type StatementImportsStatus = 'loading' | 'ready' | 'error'

const PAGE_SIZE = 5

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: PagedResponse<StatementImportResponseDto>
  failed: boolean
}

/** The user's imports (drafts to continue first, then the history), paged on the server. */
export function useStatementImports() {
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  const requestKey = JSON.stringify([page, reloadKey])

  useEffect(() => {
    // Aborted when the page changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([page, reloadKey])

    getStatementImports(page, PAGE_SIZE, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        // The page emptied out (its last import was deleted): step back to the new last page.
        if (data.items.length === 0 && data.totalPages > 0 && data.page > data.totalPages) {
          setPage(data.totalPages)
          return
        }
        setResult({ key, data, failed: false })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [page, reloadKey])

  const data = result?.data
  const isFetching = result?.key !== requestKey
  const status: StatementImportsStatus = result?.key === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const deleteImport = useCallback(
    async (id: number) => {
      await deleteStatementImport(id)
      reload()
    },
    [reload],
  )

  return { data, status, isFetching, setPage, reload, deleteImport }
}
