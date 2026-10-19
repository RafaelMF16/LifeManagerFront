import { apiRequest } from '../../shared/services/httpClient'
import type { PagedResponse } from '../../shared/types/Paging'
import type {
  StatementImportBulkUpdateDto,
  StatementImportCommitResultDto,
  StatementImportDetailsDto,
  StatementImportRequestDto,
  StatementImportResponseDto,
  StatementImportRowDto,
  StatementImportRowListQuery,
  StatementImportRowRequestDto,
  StatementImportRowUpdateResultDto,
  StatementImportRowsChangedDto,
} from '../types/StatementImportDtos'

const BASE_PATH = '/api/StatementImports'

export function getStatementImports(page: number, pageSize: number, signal?: AbortSignal): Promise<PagedResponse<StatementImportResponseDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiRequest<PagedResponse<StatementImportResponseDto>>(`${BASE_PATH}?${params}`, { method: 'GET', signal })
}

export function getStatementImport(id: number, signal?: AbortSignal): Promise<StatementImportDetailsDto> {
  return apiRequest<StatementImportDetailsDto>(`${BASE_PATH}/${id}`, { method: 'GET', signal })
}

/** Creates the draft: the backend suggests categories and leaves out what the user already has. */
export function createStatementImport(request: StatementImportRequestDto): Promise<StatementImportResponseDto> {
  return apiRequest<StatementImportResponseDto>(BASE_PATH, { method: 'POST', body: request })
}

export function commitStatementImport(id: number): Promise<StatementImportCommitResultDto> {
  return apiRequest<StatementImportCommitResultDto>(`${BASE_PATH}/${id}/Commit`, { method: 'POST' })
}

export async function deleteStatementImport(id: number): Promise<void> {
  await apiRequest<void>(`${BASE_PATH}/${id}`, { method: 'DELETE' })
}

export function getStatementImportRows(
  id: number,
  query: StatementImportRowListQuery,
  signal?: AbortSignal,
): Promise<PagedResponse<StatementImportRowDto>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    filter: query.filter,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  })
  if (query.month) params.set('month', query.month)
  if (query.search) params.set('search', query.search)

  return apiRequest<PagedResponse<StatementImportRowDto>>(`${BASE_PATH}/${id}/Rows?${params}`, { method: 'GET', signal })
}

export function updateStatementImportRow(id: number, rowId: number, request: StatementImportRowRequestDto): Promise<StatementImportRowUpdateResultDto> {
  return apiRequest<StatementImportRowUpdateResultDto>(`${BASE_PATH}/${id}/Rows/${rowId}`, { method: 'PUT', body: request })
}

export function bulkUpdateStatementImportRows(id: number, request: StatementImportBulkUpdateDto): Promise<StatementImportRowsChangedDto> {
  return apiRequest<StatementImportRowsChangedDto>(`${BASE_PATH}/${id}/Rows/Bulk`, { method: 'POST', body: request })
}

export function applyStatementImportRowToSimilar(id: number, rowId: number): Promise<StatementImportRowsChangedDto> {
  return apiRequest<StatementImportRowsChangedDto>(`${BASE_PATH}/${id}/Rows/${rowId}/ApplyToSimilar`, { method: 'POST' })
}
