import { apiRequest } from '../../shared/services/httpClient'
import type { DashboardDaysResponseDto, FinanceDashboardQuery, FinanceDashboardResponseDto } from '../types/DashboardDtos'

const FINANCE_DASHBOARD_PATH = '/api/FinanceDashboard'

/** Everything the dashboard shows for a period, summed and compared on the server. */
export function getFinanceDashboard(query: FinanceDashboardQuery, signal?: AbortSignal): Promise<FinanceDashboardResponseDto> {
  const params = new URLSearchParams({ from: query.from, to: query.to, comparison: query.comparison })

  return apiRequest<FinanceDashboardResponseDto>(`${FINANCE_DASHBOARD_PATH}?${params}`, { method: 'GET', signal })
}

/** A `yyyy-MM` month's expenses day by day, for the dashboard's calendar. */
export function getDashboardDays(month: string, signal?: AbortSignal): Promise<DashboardDaysResponseDto> {
  const params = new URLSearchParams({ month })

  return apiRequest<DashboardDaysResponseDto>(`${FINANCE_DASHBOARD_PATH}/Days?${params}`, { method: 'GET', signal })
}
