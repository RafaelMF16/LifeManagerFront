import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiDownload } from '../../shared/services/httpClient'
import { saveBlob } from '../../shared/utils/downloadBlob'
import type { ExportFormValues } from '../validation/exportSchema'
import { exportTransactions } from './transactionService'

vi.mock('../../shared/services/httpClient', () => ({ apiDownload: vi.fn(), apiRequest: vi.fn() }))
vi.mock('../../shared/utils/downloadBlob', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../shared/utils/downloadBlob')>()),
  saveBlob: vi.fn(),
}))

const values: ExportFormValues = { from: '2026-01', to: '2026-11', type: 'Expense', format: 'PtBr' }

function answer(headers: Record<string, string>) {
  const blob = new Blob(['csv'])
  const contentDisposition = headers['Content-Disposition'] ?? null
  vi.mocked(apiDownload).mockResolvedValue({ blob, contentDisposition, headers: new Headers(headers) })
  return blob
}

describe('exportTransactions', () => {
  beforeEach(() => {
    vi.mocked(apiDownload).mockReset()
    vi.mocked(saveBlob).mockClear()
  })

  it('asks for the period, the type and the format with the abort signal', async () => {
    answer({ 'X-Row-Count': '3' })
    const controller = new AbortController()

    await exportTransactions(values, controller.signal)

    expect(apiDownload).toHaveBeenCalledWith(
      '/api/Transactions/Export?from=2026-01&to=2026-11&type=Expense&format=PtBr',
      controller.signal,
    )
  })

  it('saves nothing when the period has no transactions', async () => {
    answer({ 'X-Row-Count': '0', 'Content-Disposition': 'attachment; filename=lancamentos-2026-01_2026-11.csv' })

    expect(await exportTransactions(values)).toEqual({ rowCount: 0 })
    expect(saveBlob).not.toHaveBeenCalled()
  })

  it('saves the file under the name the backend sends', async () => {
    const blob = answer({ 'X-Row-Count': '12', 'Content-Disposition': 'attachment; filename=lancamentos-2026-01_2026-11.csv' })

    expect(await exportTransactions(values)).toEqual({ rowCount: 12 })
    expect(saveBlob).toHaveBeenCalledWith(blob, 'lancamentos-2026-01_2026-11.csv')
  })

  it('saves the file under the fallback name when the headers are missing', async () => {
    const blob = answer({})

    expect(await exportTransactions({ ...values, format: 'EnUs' })).toEqual({ rowCount: null })
    expect(saveBlob).toHaveBeenCalledWith(blob, 'transactions-2026-01_2026-11.csv')
  })
})
