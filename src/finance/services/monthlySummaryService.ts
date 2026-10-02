import { apiRequest } from '../../shared/services/httpClient'
import type { PagedResponse } from '../../shared/types/Paging'
import type {
  MonthlySummaryDetailsDto,
  MonthlySummaryListQuery,
  MonthlySummaryRequestDto,
  MonthlySummaryResponseDto,
} from '../types/MonthlySummaryDtos'
import type { MonthlySummaryFormValues } from '../validation/monthlySummarySchema'

const MONTHLY_SUMMARIES_PATH = '/api/MonthlySummaries'

export function getMonthlySummaries(
  query: MonthlySummaryListQuery,
  signal?: AbortSignal,
): Promise<PagedResponse<MonthlySummaryResponseDto>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    balance: query.balance,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  })
  if (query.year !== null) params.set('year', String(query.year))

  return apiRequest<PagedResponse<MonthlySummaryResponseDto>>(`${MONTHLY_SUMMARIES_PATH}?${params}`, { method: 'GET', signal })
}

/** One month with its totals, transaction counts and the user's neighbouring months. */
export function getMonthlySummary(id: number, signal?: AbortSignal): Promise<MonthlySummaryDetailsDto> {
  return apiRequest<MonthlySummaryDetailsDto>(`${MONTHLY_SUMMARIES_PATH}/${id}`, { method: 'GET', signal })
}

/** The distinct years the user has months in, newest first. */
export function getMonthlySummaryYears(signal?: AbortSignal): Promise<number[]> {
  return apiRequest<number[]>(`${MONTHLY_SUMMARIES_PATH}/Years`, { method: 'GET', signal })
}

export function createMonthlySummary(data: MonthlySummaryFormValues): Promise<MonthlySummaryResponseDto> {
  return apiRequest<MonthlySummaryResponseDto>(MONTHLY_SUMMARIES_PATH, {
    method: 'POST',
    body: { month: data.month } satisfies MonthlySummaryRequestDto,
  })
}
